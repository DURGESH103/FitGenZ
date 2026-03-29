const express = require("express");
const { getDiet } = require("../controllers/dietController");
const validateRequest = require("../middleware/validateRequest");
const { goalGenderQueryValidation } = require("../validations/queryValidation");

const router = express.Router();

router.get("/", goalGenderQueryValidation, validateRequest, getDiet);

module.exports = router;
