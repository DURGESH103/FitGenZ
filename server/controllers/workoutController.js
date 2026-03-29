const Workout = require("../models/Workout");
const asyncHandler = require("../utils/asyncHandler");
const { getWorkoutTemplate } = require("../utils/personalizationEngine");
const { getPagination } = require("../utils/pagination");

const getWorkouts = asyncHandler(async (req, res) => {
  const { gender, goal, level = "beginner", category = "home" } = req.query;
  const { page, limit, skip } = getPagination(req.query);
  const filter = { gender, goal, level, category };
  const [existingWorkouts, total] = await Promise.all([
    Workout.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Workout.countDocuments(filter),
  ]);

  if (existingWorkouts.length > 0) {
    return res.status(200).json({
      source: "database",
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      workouts: existingWorkouts,
    });
  }

  const template = getWorkoutTemplate({ gender, goal, level, category });
  if (!template) {
    return res.status(404).json({ message: "No workout template available for selected filters" });
  }

  return res.status(200).json({
    source: "fallback_template",
    pagination: { page, limit, total: 1, totalPages: 1 },
    workouts: [
      {
        title: template.title,
        gender,
        goal,
        level,
        category,
        exercises: template.exercises,
      },
    ],
  });
});

module.exports = { getWorkouts };
