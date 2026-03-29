const { body } = require("express-validator");

const createProgressValidation = [
  body("weight").isFloat({ min: 20, max: 350 }).withMessage("Weight must be 20-350 kg"),
  body("bodyFat")
    .optional()
    .isFloat({ min: 2, max: 70 })
    .withMessage("Body fat must be between 2 and 70"),
  body("date").optional().isISO8601().withMessage("date must be a valid ISO date"),
];

module.exports = { createProgressValidation };
