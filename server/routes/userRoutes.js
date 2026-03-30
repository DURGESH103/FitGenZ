const express = require("express");
const { 
  getProfile, 
  updateProfile, 
  uploadAvatar, 
  changePassword, 
  getPublicProfile, 
  followUser, 
  unfollowUser, 
  getFollowSuggestions 
} = require("../controllers/userController");
const { protect }  = require("../middleware/authMiddleware");
const upload       = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { updateProfileValidation } = require("../validations/userValidation");

const router = express.Router();

// Profile routes
router.get("/profile",         protect, getProfile);
router.put("/profile",         protect, updateProfileValidation, validateRequest, updateProfile);
router.post("/avatar",         protect, upload.single("avatar"), uploadAvatar);
router.post("/change-password",protect, changePassword);

// Social routes
router.get("/suggestions",     protect, getFollowSuggestions);
router.get("/:id",             protect, getPublicProfile);
router.post("/follow/:id",     protect, followUser);
router.post("/unfollow/:id",   protect, unfollowUser);

module.exports = router;
