const express = require("express");
const { query } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { recommend } = require("../controllers/aiController");

const router = express.Router();

router.get(
  "/recommend",
  protect,
  [
    query("goal")
      .optional()
      .isIn(["weight_loss", "weight_gain", "fitness"])
      .withMessage("goal must be weight_loss, weight_gain, or fitness"),
    query("prompt")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage("prompt must be a string under 500 characters"),
  ],
  validateRequest,
  recommend
);

module.exports = router;
