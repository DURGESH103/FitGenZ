const asyncHandler  = require("../utils/asyncHandler");
const UserStats     = require("../models/UserStats");
const Progress      = require("../models/Progress");
const Analytics     = require("../models/Analytics");
const { getOrCreateStats, claimDailyReward } = require("../services/gamificationService");
const { predictGoalCompletion, calcGoalProgress } = require("../services/predictionService");
const { emitToUser } = require("../config/socket");
const EVENTS         = require("../config/events");

// ── Stats ─────────────────────────────────────────────────────────────────────
const getMyStats = asyncHandler(async (req, res) => {
  const stats = await getOrCreateStats(req.user._id);
  return res.status(200).json({
    stats,
    levelInfo:        stats.getLevelInfo(),
    canClaimReward:   stats.canClaimDailyReward(),
    streakFreezes:    stats.streakFreezes,
  });
});

// ── Global Leaderboard ────────────────────────────────────────────────────────
const getLeaderboard = asyncHandler(async (req, res) => {
  const top = await UserStats.find()
    .sort({ xp: -1 })
    .limit(20)
    .populate("user", "name gender goal")
    .lean();

  const myStats = await UserStats.findOne({ user: req.user._id }).lean();
  const myRank  = myStats
    ? (await UserStats.countDocuments({ xp: { $gt: myStats.xp } })) + 1
    : null;

  const board = top.map((s, i) => ({
    rank:       i + 1,
    name:       s.user?.name || "Unknown",
    gender:     s.user?.gender,
    goal:       s.user?.goal,
    xp:         s.xp,
    weeklyXP:   s.weeklyXP,
    level:      s.level,
    levelTitle: s.levelTitle,
    streak:     s.streak,
    isMe:       s.user?._id?.toString() === req.user._id.toString(),
  }));

  return res.status(200).json({ leaderboard: board, myRank, type: "global" });
});

// ── Weekly Leaderboard ────────────────────────────────────────────────────────
const getWeeklyLeaderboard = asyncHandler(async (req, res) => {
  const top = await UserStats.find({ weeklyXP: { $gt: 0 } })
    .sort({ weeklyXP: -1 })
    .limit(20)
    .populate("user", "name gender goal")
    .lean();

  const myStats = await UserStats.findOne({ user: req.user._id }).lean();
  const myWeeklyRank = myStats
    ? (await UserStats.countDocuments({ weeklyXP: { $gt: myStats.weeklyXP || 0 } })) + 1
    : null;

  const board = top.map((s, i) => ({
    rank:       i + 1,
    name:       s.user?.name || "Unknown",
    gender:     s.user?.gender,
    goal:       s.user?.goal,
    xp:         s.xp,
    weeklyXP:   s.weeklyXP,
    level:      s.level,
    levelTitle: s.levelTitle,
    streak:     s.streak,
    isMe:       s.user?._id?.toString() === req.user._id.toString(),
  }));

  return res.status(200).json({ leaderboard: board, myRank: myWeeklyRank, type: "weekly" });
});

// ── Prediction ────────────────────────────────────────────────────────────────
const getPrediction = asyncHandler(async (req, res) => {
  const history    = await Progress.find({ user: req.user._id }).sort({ date: 1 }).lean();
  const prediction = predictGoalCompletion(history, req.user);
  const goalProgress = calcGoalProgress(history, req.user);
  return res.status(200).json({ prediction, goalProgress });
});

// ── AI Insights ───────────────────────────────────────────────────────────────
const getInsights = asyncHandler(async (req, res) => {
  const [history, stats, recentActivity] = await Promise.all([
    Progress.find({ user: req.user._id }).sort({ date: -1 }).limit(14).lean(),
    getOrCreateStats(req.user._id),
    Analytics.find({ user: req.user._id, eventType: "workout_completion" })
      .sort({ date: -1 }).limit(7).lean(),
  ]);

  const insights = [];

  // Weight trend insight
  if (history.length >= 2) {
    const latest = history[0].weight;
    const week   = history.find((h) => {
      const d = new Date(h.date);
      d.setDate(d.getDate() + 7);
      return d >= new Date();
    });
    if (week) {
      const diff = +(latest - week.weight).toFixed(1);
      if (diff < 0) insights.push(`📉 You lost ${Math.abs(diff)} kg this week — great progress!`);
      else if (diff > 0) insights.push(`📈 You gained ${diff} kg this week.`);
      else insights.push("⚖️ Your weight is stable this week.");
    }
  }

  // Streak insight
  if (stats.streak >= 7)  insights.push(`🔥 ${stats.streak}-day streak! You're on fire — keep it going!`);
  else if (stats.streak >= 3) insights.push(`💪 ${stats.streak}-day streak — consistency is building!`);
  else if (stats.streak === 0) insights.push("🎯 Start your streak today — complete a task to begin!");

  // Activity insight
  const activeDays = new Set(recentActivity.map((e) => new Date(e.date).toISOString().slice(0, 10))).size;
  if (activeDays >= 6)      insights.push("⚡ You've been active 6+ days this week — elite consistency!");
  else if (activeDays >= 4) insights.push(`✅ ${activeDays} active days this week — solid effort!`);
  else if (activeDays <= 2) insights.push("📅 Try to hit at least 4 active days this week for best results.");

  // Level insight
  const levelInfo = stats.getLevelInfo();
  if (levelInfo.progressPct >= 80) {
    insights.push(`🚀 You're ${100 - levelInfo.progressPct}% away from Level ${levelInfo.level + 1} — ${levelInfo.next}!`);
  }

  // Daily reward reminder
  if (stats.canClaimDailyReward()) {
    insights.push("🎁 Your daily reward is ready to claim — don't miss it!");
  }

  return res.status(200).json({ insights: insights.slice(0, 4) });
});

// ── Daily Reward ──────────────────────────────────────────────────────────────
const claimReward = asyncHandler(async (req, res) => {
  const result = await claimDailyReward(req.user._id);

  if (result.alreadyClaimed) {
    return res.status(400).json({ message: "Daily reward already claimed today. Come back tomorrow!" });
  }

  const uid = req.user._id.toString();

  emitToUser(uid, EVENTS.DAILY_REWARD, {
    xpGain:      result.xpGain,
    streakBonus: result.streakBonus,
    xp:          result.stats?.xp,
    weeklyXP:    result.stats?.weeklyXP,
  });

  emitToUser(uid, EVENTS.XP_GAINED, {
    xpGain:  result.xpGain,
    xp:      result.stats?.xp,
    weeklyXP:result.stats?.weeklyXP,
    source:  "daily_reward",
  });

  return res.status(200).json({
    message:     `Daily reward claimed! +${result.xpGain} XP`,
    xpGain:      result.xpGain,
    streakBonus: result.streakBonus,
    xp:          result.stats?.xp,
  });
});

// ── Use Streak Freeze ─────────────────────────────────────────────────────────
const useStreakFreeze = asyncHandler(async (req, res) => {
  const stats = await getOrCreateStats(req.user._id);
  if (stats.streakFreezes <= 0) {
    return res.status(400).json({ message: "No streak freezes available." });
  }
  // Freeze is consumed automatically in updateStreak — this endpoint just shows status
  return res.status(200).json({
    streakFreezes: stats.streakFreezes,
    streak:        stats.streak,
    message:       `You have ${stats.streakFreezes} streak freeze(s) available.`,
  });
});

module.exports = {
  getMyStats,
  getLeaderboard,
  getWeeklyLeaderboard,
  getPrediction,
  getInsights,
  claimReward,
  useStreakFreeze,
};
