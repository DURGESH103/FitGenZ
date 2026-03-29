const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:    { type: String, required: true },
    text:    { type: String, required: true, maxlength: 500, trim: true },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text:    { type: String, required: true, maxlength: 500, trim: true },
    imageUrl:{ type: String, default: null },
    likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments:{ type: [commentSchema], default: [] },
    tags:    [{ type: String, trim: true }],
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
