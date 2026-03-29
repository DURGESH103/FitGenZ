const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { generatePersonalizedPlan } = require("../services/personalizationService");

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  const { calories } = generatePersonalizedPlan({
    gender: user.gender,
    age: user.age,
    height: user.height,
    weight: user.weight,
    goal: user.goal,
  });

  return res.status(200).json({ user, calorieRecommendation: calories });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "gender", "age", "height", "weight", "goal"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) return res.status(404).json({ message: "User not found" });

  const { calories } = generatePersonalizedPlan({
    gender: user.gender,
    age: user.age,
    height: user.height,
    weight: user.weight,
    goal: user.goal,
  });

  return res.status(200).json({
    message: "Profile updated",
    user,
    calorieRecommendation: calories,
  });
});

module.exports = { getProfile, updateProfile };
