const User       = require("../models/User");
const UserStats  = require("../models/UserStats");
const Progress   = require("../models/Progress");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const { generatePersonalizedPlan } = require("../services/personalizationService");
const { calculateDailyCalories }   = require("../utils/calorieCalculator");
const { calcGoalProgress }         = require("../services/predictionService");
const { followUser: followUserService, unfollowUser: unfollowUserService, getFollowSuggestions: getSuggestionsService } = require("../services/socialService");
const { emitToUser } = require("../config/socket");

// ── Helpers ───────────────────────────────────────────────────────────────────

const calcBMI = (weight, height) => {
  const hm = height / 100;
  return +(weight / (hm * hm)).toFixed(1);
};

const bmiCategory = (bmi) => {
  if (bmi < 18.5) return { label: "Underweight", color: "blue"   };
  if (bmi < 25)   return { label: "Normal",       color: "green"  };
  if (bmi < 30)   return { label: "Overweight",   color: "yellow" };
  return              { label: "Obese",         color: "red"    };
};

const calcProtein = (weight, goal) => {
  const multiplier = goal === "weight_gain" ? 2.2 : goal === "weight_loss" ? 1.8 : 1.6;
  return Math.round(weight * multiplier);
};

/** Profile completion score 0-100 */
const calcCompletion = (user) => {
  const fields = [
    !!user.name,
    !!user.email,
    !!user.gender,
    !!user.age,
    !!user.height,
    !!user.weight,
    !!user.goal,
    !!user.avatarUrl,
    !!(user.bio && user.bio.length > 0),
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};

/** Dynamic recommendations based on goal + stats */
const buildRecommendations = (user, stats) => {
  const recs = [];
  const goal = user.goal;

  if (goal === "weight_loss") {
    recs.push("Aim for a 400–500 kcal daily deficit.");
    recs.push("Include 3–4 cardio sessions per week.");
    if (stats?.streak < 3) recs.push("Build your streak — consistency beats intensity.");
  } else if (goal === "weight_gain") {
    recs.push("Eat 300–500 kcal above maintenance daily.");
    recs.push("Prioritize compound lifts 4× per week.");
    if (stats?.totalWorkouts < 10) recs.push("Log your first 10 workouts to build momentum.");
  } else {
    recs.push("Balance cardio and strength 3× each per week.");
    recs.push("Focus on sleep quality and recovery.");
  }

  if (stats?.streak >= 7)  recs.push(`🔥 ${stats.streak}-day streak — you're unstoppable!`);
  if (stats?.level >= 5)   recs.push(`Level ${stats.level} ${stats.levelTitle} — elite territory!`);

  return recs.slice(0, 3);
};

// ── GET /api/user/profile ─────────────────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  const [user, stats, recentProgress] = await Promise.all([
    User.findById(req.user._id).select("-password"),
    UserStats.findOne({ user: req.user._id }),
    Progress.find({ user: req.user._id }).sort({ date: -1 }).limit(20).lean(),
  ]);

  if (!user) return res.status(404).json({ message: "User not found" });

  const calories    = calculateDailyCalories({ gender: user.gender, age: user.age, height: user.height, weight: user.weight, goal: user.goal });
  const protein     = calcProtein(user.weight, user.goal);
  const bmi         = calcBMI(user.weight, user.height);
  const bmiInfo     = bmiCategory(bmi);
  const completion  = calcCompletion(user);
  const goalProgress = calcGoalProgress(recentProgress, user);
  const levelInfo   = stats ? stats.getLevelInfo() : null;
  const recommendations = buildRecommendations(user, stats);

  // Weekly progress (last 7 days weight entries)
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyEntries = recentProgress.filter((p) => new Date(p.date) >= weekAgo);
  const weeklyChange  = weeklyEntries.length >= 2
    ? +(weeklyEntries[0].weight - weeklyEntries[weeklyEntries.length - 1].weight).toFixed(1)
    : null;

  return res.status(200).json({
    user,
    fitness: { bmi, bmiInfo, calories, protein },
    stats:   stats || {},
    levelInfo,
    goalProgress,
    weeklyChange,
    completion,
    recommendations,
    canClaimReward:  stats ? stats.canClaimDailyReward() : false,
    streakFreezes:   stats?.streakFreezes ?? 0,
  });
});

// ── PUT /api/user/profile ─────────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "gender", "age", "height", "weight", "goal", "bio", "isPublic"];
  const updates = {};
  allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true, runValidators: true,
  }).select("-password");

  if (!user) return res.status(404).json({ message: "User not found" });

  const calories = calculateDailyCalories({ gender: user.gender, age: user.age, height: user.height, weight: user.weight, goal: user.goal });
  return res.status(200).json({ message: "Profile updated", user, calorieRecommendation: calories });
});

// ── POST /api/user/avatar ─────────────────────────────────────────────────────
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image file provided" });

  // Convert buffer → base64 data URL (no external storage needed)
  const base64 = req.file.buffer.toString("base64");
  const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl: dataUrl },
    { new: true }
  ).select("-password");

  return res.status(200).json({ message: "Avatar updated", avatarUrl: user.avatarUrl });
});

// ── POST /api/user/change-password ───────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both currentPassword and newPassword are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await user.matchPassword(currentPassword);
  if (!match) return res.status(401).json({ message: "Current password is incorrect" });

  user.password = newPassword; // pre-save hook hashes it
  await user.save();

  return res.status(200).json({ message: "Password changed successfully" });
});

// ── GET /api/user/:id ─────────────────────────────────────────────────────────
const getPublicProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user._id;

  const [user, stats] = await Promise.all([
    User.findById(id).select("-password -email").populate("followers following", "name avatarUrl"),
    UserStats.findOne({ user: id })
  ]);

  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.isPublic && !user._id.equals(currentUserId)) {
    return res.status(403).json({ message: "This profile is private" });
  }

  const isFollowing = user.followers.some(f => f._id.equals(currentUserId));
  const isOwnProfile = user._id.equals(currentUserId);
  const levelInfo = stats ? stats.getLevelInfo() : null;

  return res.status(200).json({
    user: {
      ...user.toObject(),
      followersCount: user.followers.length,
      followingCount: user.following.length,
    },
    stats: stats || {},
    levelInfo,
    isFollowing,
    isOwnProfile
  });
});

// ── POST /api/user/follow/:id ─────────────────────────────────────────────────
const followUser = asyncHandler(async (req, res) => {
  const { id: targetUserId } = req.params;
  const currentUserId = req.user._id;

  if (targetUserId === currentUserId.toString()) {
    return res.status(400).json({ message: "Cannot follow yourself" });
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId)
  ]);

  if (!targetUser) return res.status(404).json({ message: "User not found" });
  if (!targetUser.isPublic) return res.status(403).json({ message: "Cannot follow private profile" });

  // Check if already following
  if (currentUser.following.includes(targetUserId)) {
    return res.status(400).json({ message: "Already following this user" });
  }

  // Update both users
  await Promise.all([
    User.findByIdAndUpdate(currentUserId, { $push: { following: targetUserId } }),
    User.findByIdAndUpdate(targetUserId, { $push: { followers: currentUserId } })
  ]);

  // Create notification
  const notification = new Notification({
    user: targetUserId,
    sender: currentUserId,
    type: "follow",
    title: "New Follower",
    body: `${currentUser.name} started following you`,
    metadata: { followerId: currentUserId }
  });
  await notification.save();

  // Emit real-time notification
  const populatedNotification = await Notification.findById(notification._id)
    .populate("sender", "name avatarUrl")
    .lean();
  
  emitToUser(targetUserId, "NEW_NOTIFICATION", populatedNotification);

  return res.status(200).json({ message: "User followed successfully", isFollowing: true });
});

// ── POST /api/user/unfollow/:id ───────────────────────────────────────────────
const unfollowUser = asyncHandler(async (req, res) => {
  const { id: targetUserId } = req.params;
  const currentUserId = req.user._id;

  if (targetUserId === currentUserId.toString()) {
    return res.status(400).json({ message: "Cannot unfollow yourself" });
  }

  const currentUser = await User.findById(currentUserId);
  if (!currentUser.following.includes(targetUserId)) {
    return res.status(400).json({ message: "Not following this user" });
  }

  // Update both users
  await Promise.all([
    User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } }),
    User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } })
  ]);

  return res.status(200).json({ message: "User unfollowed successfully", isFollowing: false });
});

// ── GET /api/user/suggestions ─────────────────────────────────────────────────
const getFollowSuggestions = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const currentUser = await User.findById(currentUserId);
  
  // Find users not already followed, excluding self, limit to public profiles
  const suggestions = await User.find({
    _id: { $nin: [...currentUser.following, currentUserId] },
    isPublic: true
  })
  .select("name avatarUrl bio goal")
  .limit(10)
  .lean();

  return res.status(200).json({ suggestions });
});

module.exports = { 
  getProfile, 
  updateProfile, 
  uploadAvatar, 
  changePassword, 
  getPublicProfile, 
  followUser, 
  unfollowUser, 
  getFollowSuggestions 
};
