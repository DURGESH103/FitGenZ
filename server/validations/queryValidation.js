const { query } = require("express-validator");

const paginationValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be 1-100"),
];

const goalGenderQueryValidation = [
  ...paginationValidation,
  query("gender").isIn(["male", "female"]).withMessage("gender query is required"),
  query("goal")
    .isIn(["weight_loss", "weight_gain", "fitness"])
    .withMessage("goal query is required"),
];

const workoutFilterValidation = [
  ...goalGenderQueryValidation,
  query("level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("level must be beginner/intermediate/advanced"),
  query("category").optional().isIn(["home", "gym"]).withMessage("category must be home/gym"),
];

module.exports = { paginationValidation, goalGenderQueryValidation, workoutFilterValidation };
