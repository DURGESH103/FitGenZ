const Post = require("../models/Post");
const asyncHandler = require("../utils/asyncHandler");
const { emitToUser, getIO } = require("../config/socket");

const getFeed = asyncHandler(async (req, res) => {
  const page  = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const skip  = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name gender goal")
      .populate("comments.user", "name")
      .lean(),
    Post.countDocuments(),
  ]);

  const enriched = posts.map((p) => ({
    ...p,
    likeCount:    p.likes.length,
    likedByMe:    p.likes.some((id) => id.toString() === req.user._id.toString()),
    commentCount: p.comments.length,
  }));

  return res.status(200).json({
    posts: enriched,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

const createPost = asyncHandler(async (req, res) => {
  const { text, imageUrl, tags } = req.body;
  const post = await Post.create({
    user: req.user._id,
    text,
    imageUrl: imageUrl || null,
    tags: tags || [],
  });

  const populated = await Post.findById(post._id)
    .populate("user", "name gender goal")
    .lean();

  const payload = { ...populated, likeCount: 0, likedByMe: false, commentCount: 0 };

  // Broadcast new post to all connected clients
  const io = getIO();
  if (io) io.emit("feed:new_post", payload);

  return res.status(201).json({ post: payload });
});

const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const userId   = req.user._id.toString();
  const likedIdx = post.likes.findIndex((id) => id.toString() === userId);
  const liked    = likedIdx === -1;

  if (liked) post.likes.push(req.user._id);
  else       post.likes.splice(likedIdx, 1);

  await post.save();

  const io = getIO();
  if (io) io.emit("feed:like_update", { postId: post._id, likeCount: post.likes.length });

  return res.status(200).json({ liked, likeCount: post.likes.length });
});

const addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const comment = { user: req.user._id, name: req.user.name, text: req.body.text };
  post.comments.push(comment);
  await post.save();

  const added = post.comments[post.comments.length - 1];

  const io = getIO();
  if (io) io.emit("feed:comment_added", { postId: post._id, comment: added, commentCount: post.comments.length });

  return res.status(201).json({ comment: added, commentCount: post.comments.length });
});

module.exports = { getFeed, createPost, toggleLike, addComment };
