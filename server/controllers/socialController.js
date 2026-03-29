const Post     = require("../models/Post");
const Follow   = require("../models/Follow");
const asyncHandler = require("../utils/asyncHandler");
const { getIO } = require("../config/socket");
const EVENTS    = require("../config/events");

// ── Feed (all posts) ──────────────────────────────────────────────────────────
const getFeed = asyncHandler(async (req, res) => {
  const page  = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const skip  = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find()
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit)
      .populate("user", "name gender goal")
      .populate("comments.user", "name")
      .lean(),
    Post.countDocuments(),
  ]);

  const myId    = req.user._id.toString();
  const enriched = posts.map((p) => ({
    ...p,
    likeCount:    p.likes.length,
    likedByMe:    p.likes.some((id) => id.toString() === myId),
    commentCount: p.comments.length,
  }));

  return res.status(200).json({
    posts: enriched,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// ── Following Feed ────────────────────────────────────────────────────────────
const getFollowingFeed = asyncHandler(async (req, res) => {
  const page  = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const skip  = (page - 1) * limit;

  const follows = await Follow.find({ follower: req.user._id }).lean();
  const followingIds = follows.map((f) => f.following);

  const [posts, total] = await Promise.all([
    Post.find({ user: { $in: [...followingIds, req.user._id] } })
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit)
      .populate("user", "name gender goal")
      .populate("comments.user", "name")
      .lean(),
    Post.countDocuments({ user: { $in: [...followingIds, req.user._id] } }),
  ]);

  const myId    = req.user._id.toString();
  const enriched = posts.map((p) => ({
    ...p,
    likeCount:    p.likes.length,
    likedByMe:    p.likes.some((id) => id.toString() === myId),
    commentCount: p.comments.length,
  }));

  return res.status(200).json({
    posts: enriched,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// ── Create Post ───────────────────────────────────────────────────────────────
const createPost = asyncHandler(async (req, res) => {
  const { text, imageUrl, tags } = req.body;
  const post = await Post.create({ user: req.user._id, text, imageUrl: imageUrl || null, tags: tags || [] });

  const populated = await Post.findById(post._id)
    .populate("user", "name gender goal").lean();

  const payload = { ...populated, likeCount: 0, likedByMe: false, commentCount: 0 };

  const io = getIO();
  if (io) io.emit(EVENTS.FEED_NEW_POST, payload);

  return res.status(201).json({ post: payload });
});

// ── Like / Unlike ─────────────────────────────────────────────────────────────
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
  if (io) io.emit(EVENTS.FEED_LIKE, { postId: post._id, likeCount: post.likes.length });

  return res.status(200).json({ liked, likeCount: post.likes.length });
});

// ── Comment ───────────────────────────────────────────────────────────────────
const addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  post.comments.push({ user: req.user._id, name: req.user.name, text: req.body.text });
  await post.save();

  const added = post.comments[post.comments.length - 1];
  const io    = getIO();
  if (io) io.emit(EVENTS.FEED_COMMENT, { postId: post._id, comment: added, commentCount: post.comments.length });

  return res.status(201).json({ comment: added, commentCount: post.comments.length });
});

// ── Follow / Unfollow ─────────────────────────────────────────────────────────
const toggleFollow = asyncHandler(async (req, res) => {
  const targetId = req.params.userId;
  if (targetId === req.user._id.toString()) {
    return res.status(400).json({ message: "Cannot follow yourself" });
  }

  const existing = await Follow.findOne({ follower: req.user._id, following: targetId });

  if (existing) {
    await existing.deleteOne();
    return res.status(200).json({ following: false });
  }

  await Follow.create({ follower: req.user._id, following: targetId });
  return res.status(200).json({ following: true });
});

// ── Follow Counts ─────────────────────────────────────────────────────────────
const getFollowCounts = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user._id;
  const [followers, following, isFollowing] = await Promise.all([
    Follow.countDocuments({ following: userId }),
    Follow.countDocuments({ follower: userId }),
    req.params.userId
      ? Follow.exists({ follower: req.user._id, following: userId })
      : Promise.resolve(null),
  ]);
  return res.status(200).json({ followers, following, isFollowing: !!isFollowing });
});

module.exports = { getFeed, getFollowingFeed, createPost, toggleLike, addComment, toggleFollow, getFollowCounts };
