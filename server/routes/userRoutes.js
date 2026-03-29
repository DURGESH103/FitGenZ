const express = require("express");
const { getProfile, updateProfile, uploadAvatar, changePassword } = require("../controllers/userController");
const { protect }  = require("../middleware/authMiddleware");
const upload       = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { updateProfileValidation } = require("../validations/userValidation");

const router = express.Router();

router.get("/profile",         protect, getProfile);
router.put("/profile",         protect, updateProfileValidation, validateRequest, updateProfile);
router.post("/avatar",         protect, upload.single("avatar"), uploadAvatar);
router.post("/change-password",protect, changePassword);

module.exports = router;
