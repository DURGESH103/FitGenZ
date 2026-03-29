const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getMyStats,
  getLeaderboard,
  getWeeklyLeaderboard,
  getPrediction,
  getInsights,
  claimReward,
  useStreakFreeze,
} = require("../controllers/gamificationController");

const router = express.Router();

router.get("/stats",              protect, getMyStats);
router.get("/leaderboard",        protect, getLeaderboard);
router.get("/leaderboard/weekly", protect, getWeeklyLeaderboard);
router.get("/prediction",         protect, getPrediction);
router.get("/insights",           protect, getInsights);
router.post("/reward/claim",      protect, claimReward);
router.get("/streak/freeze",      protect, useStreakFreeze);

module.exports = router;
