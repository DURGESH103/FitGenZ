const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    time: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    calories: { type: Number, required: true, min: 0 },
    protein: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const dietSchema = new mongoose.Schema(
  {
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
    meals: { type: [mealSchema], required: true, default: [] },
  },
  { timestamps: true }
);

dietSchema.index({ gender: 1, goal: 1 });

module.exports = mongoose.model("Diet", dietSchema);
