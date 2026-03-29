const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sets: { type: Number, required: true, min: 1 },
    reps: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
      index: true,
    },
    goal: {
      type: String,
      enum: ["weight_loss", "weight_gain", "fitness"],
      required: true,
      index: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate"],
      default: "beginner",
      index: true,
    },
    category: {
      type: String,
      enum: ["home", "gym"],
      default: "home",
      index: true,
    },
    exercises: { type: [exerciseSchema], required: true, default: [] },
  },
  { timestamps: true }
);

workoutSchema.index({ gender: 1, goal: 1, level: 1, category: 1 });

module.exports = mongoose.model("Workout", workoutSchema);
