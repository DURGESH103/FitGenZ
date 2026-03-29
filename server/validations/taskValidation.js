const { body } = require("express-validator");

const completeTaskValidation = [
  body("completed").isBoolean().withMessage("completed must be true/false"),
];

module.exports = { completeTaskValidation };
