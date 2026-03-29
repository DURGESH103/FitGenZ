const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");
const { trackEvent } = require("../services/analyticsService");
const { awardXP, updateStreak } = require("../services/gamificationService");
const { emitToUser } = require("../config/socket");
const { getPagination } = require("../utils/pagination");

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const defaultTitles = [
  "Complete 30 minutes workout",
  "Hit daily protein target",
  "Drink at least 2.5L water",
];

const getDailyTasks = asyncHandler(async (req, res) => {
  const { start, end } = getTodayRange();
  const { page, limit, skip } = getPagination(req.query, 10, 50);
  let tasks = await Task.find({
    user: req.user._id,
    date: { $gte: start, $lte: end },
  })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);

  if (tasks.length === 0) {
    const today = new Date(start);
    try {
      tasks = await Task.insertMany(
        defaultTitles.map((title) => ({
          user: req.user._id,
          title,
          completed: false,
          date: today,
        })),
        { ordered: false }
      );
    } catch (err) {
      if (err.code !== 11000) throw err;
      tasks = await Task.find({ user: req.user._id, date: { $gte: start, $lte: end } })
        .sort({ createdAt: 1 })
        .limit(limit);
    }
  }

  return res.status(200).json({ pagination: { page, limit }, tasks });
});

const markTaskComplete = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.taskId, user: req.user._id });
  if (!task) return res.status(404).json({ message: "Task not found" });

  const wasCompleted = task.completed;
  task.completed = req.body.completed;
  await task.save();

  if (task.completed && !wasCompleted) {
    // Track analytics
    await trackEvent({
      user: req.user._id,
      eventType: "workout_completion",
      metadata: { taskId: task._id.toString(), title: task.title },
    });

    // Update streak
    const streak = await updateStreak(req.user._id);

    // Check if all tasks done today
    const { start, end } = getTodayRange();
    const allTasks = await Task.find({ user: req.user._id, date: { $gte: start, $lte: end } });
    const allDone  = allTasks.every((t) => t._id.equals(task._id) ? true : t.completed);

    // Award XP
    const xpResult = await awardXP(req.user._id, "task_complete", { incrementTasks: true });
    let bonusXP = null;
    if (allDone) {
      bonusXP = await awardXP(req.user._id, "all_tasks_done");
    }

    // Emit real-time update to user
    emitToUser(req.user._id.toString(), "stats:update", {
      streak,
      xp: xpResult?.stats?.xp,
      level: xpResult?.stats?.level,
      levelTitle: xpResult?.stats?.levelTitle,
      xpGain: (xpResult?.xpGain || 0) + (bonusXP?.xpGain || 0),
      leveledUp: xpResult?.leveledUp || bonusXP?.leveledUp,
      newBadges: [...(xpResult?.newBadges || []), ...(bonusXP?.newBadges || [])],
    });

    emitToUser(req.user._id.toString(), "task:updated", { task, streak });
  }

  return res.status(200).json({ message: "Task updated", task });
});

module.exports = { getDailyTasks, markTaskComplete };
