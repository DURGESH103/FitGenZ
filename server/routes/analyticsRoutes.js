const express = require("express");
const { body, query } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { paginationValidation } = require("../validations/queryValidation");
const { createAnalyticsEvent, getAnalyticsHistory } = require("../controllers/analyticsController");

const router = express.Router();

router.post(
  "/track",
  protect,
  [
    body("eventType")
      .isIn(["user_activity", "workout_completion", "streak"])
      .withMessage("Invalid analytics event type"),
    body("value").optional().isNumeric().withMessage("value must be numeric"),
    body("date").optional().isISO8601().withMessage("date must be valid ISO date"),
  ],
  validateRequest,
  createAnalyticsEvent
);

router.get(
  "/",
  protect,
  [
    ...paginationValidation,
    query("eventType")
      .optional()
      .isIn(["user_activity", "workout_completion", "streak"])
      .withMessage("Invalid analytics eventType"),
  ],
  validateRequest,
  getAnalyticsHistory
);

module.exports = router;
