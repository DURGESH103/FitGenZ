const Task     = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");
const { trackEvent }           = require("../services/analyticsService");
const { awardXP, updateStreak } = require("../services/gamificationService");
const { emitToUser }           = require("../config/socket");
const EVENTS                   = require("../config/events");
const { getPagination }        = require("../utils/pagination");

const getTodayRange = () => {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end   = new Date(); end.setHours(23, 59, 59, 999);
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
  let tasks = await Task.find({ user: req.user._id, date: { $gte: start, $lte: end } })
    .sort({ createdAt: 1 }).skip(skip).limit(limit);

  if (tasks.length === 0) {
    try {
      tasks = await Task.insertMany(
        defaultTitles.map((title) => ({ user: req.user._id, title, completed: false, date: new Date(start) })),
        { ordered: false }
      );
    } catch (err) {
      if (err.code !== 11000) throw err;
      tasks = await Task.find({ user: req.user._id, date: { $gte: start, $lte: end } })
        .sort({ createdAt: 1 }).limit(limit);
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
    await trackEvent({
      user: req.user._id,
      eventType: "workout_completion",
      metadata: { taskId: task._id.toString(), title: task.title },
    });

    const { streak, usedFreeze } = await updateStreak(req.user._id);

    const { start, end } = getTodayRange();
    const allTasks = await Task.find({ user: req.user._id, date: { $gte: start, $lte: end } });
    const allDone  = allTasks.every((t) => (t._id.equals(task._id) ? true : t.completed));

    const xpResult  = await awardXP(req.user._id, "task_complete", { incrementTasks: true });
    const bonusXP   = allDone ? await awardXP(req.user._id, "all_tasks_done") : null;
    const uid       = req.user._id.toString();
    const totalXP   = (xpResult?.xpGain || 0) + (bonusXP?.xpGain || 0);
    const finalStats = bonusXP?.stats || xpResult?.stats;

    // Named event: TASK_COMPLETED
    emitToUser(uid, EVENTS.TASK_COMPLETED, { task, streak, usedFreeze });

    // Named event: XP_GAINED
    emitToUser(uid, EVENTS.XP_GAINED, {
      xpGain:    totalXP,
      xp:        finalStats?.xp,
      weeklyXP:  finalStats?.weeklyXP,
      source:    allDone ? "all_tasks_done" : "task_complete",
    });

    // Named event: STREAK_UPDATED
    emitToUser(uid, EVENTS.STREAK_UPDATED, { streak, usedFreeze });

    // Named event: LEVEL_UP (only if leveled up)
    if (xpResult?.leveledUp || bonusXP?.leveledUp) {
      emitToUser(uid, EVENTS.LEVEL_UP, {
        level:      finalStats?.level,
        levelTitle: finalStats?.levelTitle,
      });
    }

    // Aggregate STATS_UPDATE for dashboard sync
    emitToUser(uid, EVENTS.STATS_UPDATE, {
      streak,
      xp:         finalStats?.xp,
      weeklyXP:   finalStats?.weeklyXP,
      level:      finalStats?.level,
      levelTitle: finalStats?.levelTitle,
      xpGain:     totalXP,
      leveledUp:  xpResult?.leveledUp || bonusXP?.leveledUp,
      newBadges:  [...(xpResult?.newBadges || []), ...(bonusXP?.newBadges || [])],
    });

    if (allDone) emitToUser(uid, EVENTS.TASKS_ALL_DONE, { streak });
  }

  return res.status(200).json({ message: "Task updated", task });
});

module.exports = { getDailyTasks, markTaskComplete };
