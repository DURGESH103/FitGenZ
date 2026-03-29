const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getMyStats, getLeaderboard, getPrediction } = require("../controllers/gamificationController");

const router = express.Router();

router.get("/stats",       protect, getMyStats);
router.get("/leaderboard", protect, getLeaderboard);
router.get("/prediction",  protect, getPrediction);

module.exports = router;
