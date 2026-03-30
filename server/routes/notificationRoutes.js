const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAllRead,
  markAsRead,
  savePushSubscription,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/",           protect, getNotifications);
router.patch("/read-all", protect, markAllRead);
router.patch("/:id/read", protect, markAsRead);
router.post("/push",      protect, savePushSubscription);

module.exports = router;
