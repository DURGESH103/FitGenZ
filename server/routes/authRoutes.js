const express = require("express");
const { signup, login, refresh, logout } = require("../controllers/authController");
const validateRequest = require("../middleware/validateRequest");
const { signupValidation, loginValidation } = require("../validations/authValidation");

const router = express.Router();

router.post("/signup", signupValidation, validateRequest, signup);

router.post("/login", loginValidation, validateRequest, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;
