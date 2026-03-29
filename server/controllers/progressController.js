const Progress = require("../models/Progress");
const asyncHandler = require("../utils/asyncHandler");
const { trackEvent } = require("../services/analyticsService");
const { awardXP } = require("../services/gamificationService");
const { emitToUser } = require("../config/socket");
const { getPagination } = require("../utils/pagination");

const createProgressEntry = asyncHandler(async (req, res) => {
  const entry = await Progress.create({
    user: req.user._id,
    weight: req.body.weight,
    bodyFat: req.body.bodyFat,
    date: req.body.date || new Date(),
  });

  await trackEvent({
    user: req.user._id,
    eventType: "user_activity",
    metadata: { action: "progress_logged", weight: req.body.weight },
  });

  const xpResult = await awardXP(req.user._id, "progress_logged");

  emitToUser(req.user._id.toString(), "progress:new", {
    entry,
    xpGain: xpResult?.xpGain,
    xp: xpResult?.stats?.xp,
    level: xpResult?.stats?.level,
  });

  return res.status(201).json({
    message: "Progress entry created",
    progress: entry,
    xpGain: xpResult?.xpGain,
  });
});

const getProgressHistory = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { user: req.user._id };
  const [history, total] = await Promise.all([
    Progress.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
    Progress.countDocuments(filter),
  ]);
  return res.status(200).json({
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    history,
  });
});

module.exports = { createProgressEntry, getProgressHistory };
