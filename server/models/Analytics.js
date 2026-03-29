const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventType: {
      type: String,
      enum: ["user_activity", "workout_completion", "streak"],
      required: true,
      index: true,
    },
    value: { type: Number, default: 1 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    date: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

analyticsSchema.index({ user: 1, eventType: 1, date: -1 });

module.exports = mongoose.model("Analytics", analyticsSchema);
