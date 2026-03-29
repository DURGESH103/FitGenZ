const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false, index: true },
    date: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model("Task", taskSchema);
