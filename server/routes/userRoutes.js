const express = require("express");
const { getProfile, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { updateProfileValidation } = require("../validations/userValidation");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfileValidation, validateRequest, updateProfile);

module.exports = router;
