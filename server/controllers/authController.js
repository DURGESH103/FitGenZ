const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const asyncHandler = require("../utils/asyncHandler");
const { generatePersonalizedPlan } = require("../services/personalizationService");
const { trackEvent } = require("../services/analyticsService");
const {
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokenUtils");

const buildAuthResponse = ({ user, calories, accessToken }) => ({
  message: "Auth successful",
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    gender: user.gender,
    age: user.age,
    height: user.height,
    weight: user.weight,
    goal: user.goal,
  },
  calorieRecommendation: calories,
  accessToken,
});

const persistRefreshToken = async ({ userId, refreshToken, req }) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    user: userId,
    tokenHash: hashToken(refreshToken),
    expiresAt,
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip || "",
  });
};

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, gender, age, height, weight, goal } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const user = await User.create({
    name,
    email,
    password,
    gender,
    age,
    height,
    weight,
    goal,
  });

  const { calories } = generatePersonalizedPlan({ gender, age, height, weight, goal });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  await persistRefreshToken({ userId: user._id, refreshToken, req });
  await trackEvent({ user: user._id, eventType: "user_activity", metadata: { action: "signup" } });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json(
    buildAuthResponse({ user, calories, accessToken })
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const { calories } = generatePersonalizedPlan({
    gender: user.gender,
    age: user.age,
    height: user.height,
    weight: user.weight,
    goal: user.goal,
  });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  await persistRefreshToken({ userId: user._id, refreshToken, req });
  await trackEvent({ user: user._id, eventType: "user_activity", metadata: { action: "login" } });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(
    buildAuthResponse({ user, calories, accessToken })
  );
});

const refresh = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.body.refreshToken || req.cookies.refreshToken;
  if (!incomingRefreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  const decoded = verifyRefreshToken(incomingRefreshToken);
  const tokenHash = hashToken(incomingRefreshToken);
  const stored = await RefreshToken.findOne({
    user: decoded.id,
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!stored) {
    return res.status(401).json({ message: "Refresh token invalid or expired" });
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user) return res.status(401).json({ message: "User not found" });

  stored.revokedAt = new Date();
  await stored.save();

  const newRefreshToken = generateRefreshToken(user._id);
  await persistRefreshToken({ userId: user._id, refreshToken: newRefreshToken, req });
  const accessToken = generateAccessToken(user._id);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    message: "Token refreshed",
    accessToken,
    refreshToken: newRefreshToken,
  });
});

const logout = (req, res) => {
  try {
    const incomingRefreshToken = req.body.refreshToken || req.cookies.refreshToken;
    
    // Async token cleanup - don't wait for it
    if (incomingRefreshToken && typeof incomingRefreshToken === 'string' && incomingRefreshToken.length > 0) {
      const tokenHash = hashToken(incomingRefreshToken);
      RefreshToken.updateMany(
        { tokenHash, revokedAt: null }, 
        { $set: { revokedAt: new Date() } }
      ).catch(error => {
        console.error('Error revoking refresh token:', error.message);
      });
    }

    // Clear the cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/"
    });
    
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(200).json({ message: "Logged out successfully" });
  }
};

module.exports = { signup, login, refresh, logout };
