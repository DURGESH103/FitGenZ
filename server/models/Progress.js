const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weight: { type: Number, required: true, min: 20, max: 350 },
    bodyFat: { type: Number, min: 2, max: 70 },
    date: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("Progress", progressSchema);
