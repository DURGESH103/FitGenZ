const Diet = require("../models/Diet");
const asyncHandler = require("../utils/asyncHandler");
const { getDietTemplate } = require("../utils/personalizationEngine");
const { getPagination } = require("../utils/pagination");

const getDiet = asyncHandler(async (req, res) => {
  const { gender, goal } = req.query;
  const { page, limit, skip } = getPagination(req.query);
  const filter = { gender, goal };
  const [existingPlans, total] = await Promise.all([
    Diet.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Diet.countDocuments(filter),
  ]);

  if (existingPlans.length > 0) {
    return res.status(200).json({
      source: "database",
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      diets: existingPlans,
    });
  }

  const meals = getDietTemplate({ gender, goal });
  if (!meals) {
    return res.status(404).json({ message: "No diet template available for selected filters" });
  }

  return res.status(200).json({
    source: "fallback_template",
    pagination: { page, limit, total: 1, totalPages: 1 },
    diets: [{ gender, goal, meals }],
    note: "Indian, budget-friendly sample diet generated from internal templates.",
  });
});

module.exports = { getDiet };
