const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { completeTaskValidation } = require("../validations/taskValidation");
const { paginationValidation } = require("../validations/queryValidation");
const { getDailyTasks, markTaskComplete } = require("../controllers/taskController");

const router = express.Router();

router.get("/", protect, paginationValidation, validateRequest, getDailyTasks);
router.patch("/:taskId/complete", protect, completeTaskValidation, validateRequest, markTaskComplete);

module.exports = router;
