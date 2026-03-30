const asyncHandler = require("../utils/asyncHandler");
const Notification = require("../models/Notification");
const UserStats = require("../models/UserStats");

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .populate("sender", "name avatarUrl")
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();
  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
  return res.status(200).json({ notifications, unreadCount });
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
  return res.status(200).json({ message: "All notifications marked as read" });
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Notification.findOneAndUpdate(
    { _id: id, user: req.user._id },
    { $set: { read: true } }
  );
  return res.status(200).json({ message: "Notification marked as read" });
});

const savePushSubscription = asyncHandler(async (req, res) => {
  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ message: "subscription required" });
  await UserStats.findOneAndUpdate(
    { user: req.user._id },
    { pushSubscription: subscription },
    { upsert: true }
  );
  return res.status(200).json({ message: "Push subscription saved" });
});

module.exports = { getNotifications, markAllRead, markAsRead, savePushSubscription };
