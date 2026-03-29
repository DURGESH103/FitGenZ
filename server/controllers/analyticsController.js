const Analytics = require("../models/Analytics");
const asyncHandler = require("../utils/asyncHandler");
const { getPagination } = require("../utils/pagination");
const { trackEvent } = require("../services/analyticsService");

const createAnalyticsEvent = asyncHandler(async (req, res) => {
  const event = await trackEvent({
    user: req.user._id,
    eventType: req.body.eventType,
    value: req.body.value || 1,
    metadata: req.body.metadata || {},
    date: req.body.date ? new Date(req.body.date) : new Date(),
  });

  return res.status(201).json({ message: "Event tracked", event });
});

const getAnalyticsHistory = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { user: req.user._id };
  if (req.query.eventType) filter.eventType = req.query.eventType;

  const [events, total] = await Promise.all([
    Analytics.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
    Analytics.countDocuments(filter),
  ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const streakEvents = await Analytics.find({
    user: req.user._id,
    eventType: "workout_completion",
    date: { $gte: thirtyDaysAgo },
  })
    .sort({ date: -1 })
    .lean();

  let streak = 0;
  const seenDays = new Set(streakEvents.map((e) => new Date(e.date).toISOString().slice(0, 10)));
  const current = new Date();
  while (true) {
    const key = current.toISOString().slice(0, 10);
    if (!seenDays.has(key)) break;
    streak += 1;
    current.setDate(current.getDate() - 1);
  }

  return res.status(200).json({
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    streak,
    events,
  });
});

module.exports = { createAnalyticsEvent, getAnalyticsHistory };
