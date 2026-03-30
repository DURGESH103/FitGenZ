const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["streak_alert", "workout_reminder", "level_up", "badge_earned", "goal_milestone", "follow", "like", "comment"],
      required: true,
    },
    title:   { type: String, required: true },
    body:    { type: String, required: true },
    read:    { type: Boolean, default: false, index: true },
    sender:  { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who triggered the notification
    metadata:{ type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
