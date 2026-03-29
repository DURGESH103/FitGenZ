const { body } = require("express-validator");

const signupValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 6, max: 64 })
    .withMessage("Password must be 6-64 characters"),
  body("gender").isIn(["male", "female"]).withMessage("Gender must be male/female"),
  body("goal")
    .isIn(["weight_loss", "weight_gain", "fitness"])
    .withMessage("Goal must be weight_loss, weight_gain, or fitness"),
  body("age").isInt({ min: 10, max: 100 }).withMessage("Age must be 10-100"),
  body("height").isFloat({ min: 80, max: 260 }).withMessage("Height must be 80-260 cm"),
  body("weight").isFloat({ min: 20, max: 350 }).withMessage("Weight must be 20-350 kg"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = { signupValidation, loginValidation };
