const { body } = require("express-validator");

const updateProfileValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("gender").optional().isIn(["male", "female"]).withMessage("Gender must be male/female"),
  body("goal")
    .optional()
    .isIn(["weight_loss", "weight_gain", "fitness"])
    .withMessage("Goal must be weight_loss, weight_gain, or fitness"),
  body("age").optional().isInt({ min: 10, max: 100 }).withMessage("Age must be 10-100"),
  body("height").optional().isFloat({ min: 80, max: 260 }).withMessage("Height must be 80-260 cm"),
  body("weight").optional().isFloat({ min: 20, max: 350 }).withMessage("Weight must be 20-350 kg"),
  body("bio").optional().isLength({ max: 200 }).withMessage("Bio max 200 characters"),
  body("isPublic").optional().isBoolean().withMessage("isPublic must be boolean"),
];

module.exports = { updateProfileValidation };
