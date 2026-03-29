const express = require("express");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { getFeed, createPost, toggleLike, addComment } = require("../controllers/socialController");

const router = express.Router();

router.get("/feed", protect, getFeed);

router.post(
  "/post",
  protect,
  [
    body("text").trim().notEmpty().isLength({ max: 500 }).withMessage("Text required, max 500 chars"),
    body("imageUrl").optional().isURL().withMessage("imageUrl must be a valid URL"),
  ],
  validateRequest,
  createPost
);

router.patch("/post/:postId/like",    protect, toggleLike);

router.post(
  "/post/:postId/comment",
  protect,
  [body("text").trim().notEmpty().isLength({ max: 500 }).withMessage("Comment text required")],
  validateRequest,
  addComment
);

module.exports = router;
