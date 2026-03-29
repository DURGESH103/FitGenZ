const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });

const generateRefreshToken = (id) =>
  jwt.sign({ id, type: "refresh" }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });

const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

module.exports = {
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
