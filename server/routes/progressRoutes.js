const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { createProgressValidation } = require("../validations/progressValidation");
const { paginationValidation } = require("../validations/queryValidation");
const { createProgressEntry, getProgressHistory } = require("../controllers/progressController");

const router = express.Router();

router
  .route("/")
  .post(protect, createProgressValidation, validateRequest, createProgressEntry)
  .get(protect, paginationValidation, validateRequest, getProgressHistory);

module.exports = router;
