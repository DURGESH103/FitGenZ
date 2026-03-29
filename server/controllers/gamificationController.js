const asyncHandler = require("../utils/asyncHandler");
const UserStats = require("../models/UserStats");
const User = require("../models/User");
const Progress = require("../models/Progress");
const { getOrCreateStats } = require("../services/gamificationService");
const { predictGoalCompletion, calcGoalProgress } = require("../services/predictionService");

const getMyStats = asyncHandler(async (req, res) => {
  const stats = await getOrCreateStats(req.user._id);
  return res.status(200).json({ stats, levelInfo: stats.getLevelInfo() });
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const top = await UserStats.find()
    .sort({ xp: -1 })
    .limit(20)
    .populate("user", "name gender goal")
    .lean();

  const myStats = await UserStats.findOne({ user: req.user._id }).lean();
  const myRank = myStats
    ? (await UserStats.countDocuments({ xp: { $gt: myStats.xp } })) + 1
    : null;

  const board = top.map((s, i) => ({
    rank: i + 1,
    name: s.user?.name || "Unknown",
    gender: s.user?.gender,
    goal: s.user?.goal,
    xp: s.xp,
    level: s.level,
    levelTitle: s.levelTitle,
    streak: s.streak,
    isMe: s.user?._id?.toString() === req.user._id.toString(),
  }));

  return res.status(200).json({ leaderboard: board, myRank });
});

const getPrediction = asyncHandler(async (req, res) => {
  const history = await Progress.find({ user: req.user._id })
    .sort({ date: 1 })
    .lean();

  const prediction = predictGoalCompletion(history, req.user);
  const goalProgress = calcGoalProgress(history, req.user);

  return res.status(200).json({ prediction, goalProgress });
});

module.exports = { getMyStats, getLeaderboard, getPrediction };
