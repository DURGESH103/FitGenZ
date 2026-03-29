const express = require("express");
const { getWorkouts } = require("../controllers/workoutController");
const validateRequest = require("../middleware/validateRequest");
const { workoutFilterValidation } = require("../validations/queryValidation");

const router = express.Router();

router.get("/", workoutFilterValidation, validateRequest, getWorkouts);

module.exports = router;
