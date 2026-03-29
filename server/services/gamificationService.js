const UserStats = require("../models/UserStats");
const Notification = require("../models/Notification");

const XP_REWARDS = {
  task_complete:    20,
  all_tasks_done:   50,
  progress_logged:  30,
  streak_milestone: 100,
  workout_logged:   40,
};

const BADGE_RULES = [
  { id: "first_login",    icon: "🎯", label: "First Login",    check: (s) => s.totalTasksDone >= 1 },
  { id: "week_warrior",   icon: "🔥", label: "Week Warrior",   check: (s) => s.streak >= 7 },
  { id: "iron_will",      icon: "💪", label: "Iron Will",      check: (s) => s.streak >= 14 },
  { id: "diet_master",    icon: "🥗", label: "Diet Master",    check: (s) => s.totalTasksDone >= 30 },
  { id: "consistency",    icon: "⚡", label: "Consistent",     check: (s) => s.streak >= 21 },
  { id: "goal_crusher",   icon: "🏆", label: "Goal Crusher",   check: (s) => s.totalWorkouts >= 50 },
  { id: "century_club",   icon: "💯", label: "Century Club",   check: (s) => s.totalTasksDone >= 100 },
  { id: "xp_500",         icon: "⭐", label: "XP Hunter",      check: (s) => s.xp >= 500 },
  { id: "xp_1000",        icon: "🌟", label: "XP Master",      check: (s) => s.xp >= 1000 },
];

const getOrCreateStats = async (userId) => {
  let stats = await UserStats.findOne({ user: userId });
  if (!stats) stats = await UserStats.create({ user: userId });
  return stats;
};

const checkAndAwardBadges = async (stats) => {
  const newBadges = [];
  const earnedIds = new Set(stats.badges.map((b) => b.id));
  for (const rule of BADGE_RULES) {
    if (!earnedIds.has(rule.id) && rule.check(stats)) {
      stats.badges.push({ id: rule.id, icon: rule.icon, label: rule.label });
      newBadges.push({ id: rule.id, icon: rule.icon, label: rule.label });
    }
  }
  return newBadges;
};

const getLevelFromXP = (xp) => {
  const levels = UserStats.LEVELS;
  const sorted = [...levels].sort((a, b) => b.xpRequired - a.xpRequired);
  return sorted.find((l) => xp >= l.xpRequired) || levels[0];
};

/**
 * Award XP to a user and handle level-ups + badge checks.
 * Returns { stats, leveledUp, newBadges, newLevel }
 */
const awardXP = async (userId, action, extra = {}) => {
  const xpGain = XP_REWARDS[action] || 0;
  if (xpGain === 0) return null;

  const stats = await getOrCreateStats(userId);
  const prevLevel = stats.level;

  stats.xp += xpGain;
  if (extra.incrementWorkouts) stats.totalWorkouts += 1;
  if (extra.incrementTasks)    stats.totalTasksDone += 1;

  const newLevelInfo = getLevelFromXP(stats.xp);
  stats.level      = newLevelInfo.level;
  stats.levelTitle = newLevelInfo.title;

  const newBadges = await checkAndAwardBadges(stats);
  await stats.save();

  const leveledUp = stats.level > prevLevel;

  if (leveledUp) {
    await Notification.create({
      user: userId,
      type: "level_up",
      title: "Level Up! 🎉",
      body: `You reached Level ${stats.level} — ${stats.levelTitle}!`,
      metadata: { level: stats.level, title: stats.levelTitle },
    });
  }

  for (const badge of newBadges) {
    await Notification.create({
      user: userId,
      type: "badge_earned",
      title: `Badge Unlocked: ${badge.label} ${badge.icon}`,
      body: `You earned the "${badge.label}" badge!`,
      metadata: badge,
    });
  }

  return { stats, leveledUp, newBadges, newLevel: leveledUp ? newLevelInfo : null, xpGain };
};

/**
 * Update streak for a user. Call after any workout/task completion.
 * Returns updated streak value.
 */
const updateStreak = async (userId) => {
  const stats = await getOrCreateStats(userId);
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = stats.lastActivityDate
    ? new Date(stats.lastActivityDate).toISOString().slice(0, 10)
    : null;

  if (lastDate === today) return stats.streak; // already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  if (lastDate === yStr) {
    stats.streak += 1;
  } else {
    stats.streak = 1; // reset
  }

  stats.lastActivityDate = new Date();
  if (stats.streak > stats.longestStreak) stats.longestStreak = stats.streak;

  // Streak milestone XP
  if ([7, 14, 21, 30, 60, 100].includes(stats.streak)) {
    stats.xp += XP_REWARDS.streak_milestone;
    const newLevelInfo = getLevelFromXP(stats.xp);
    stats.level      = newLevelInfo.level;
    stats.levelTitle = newLevelInfo.title;
    await Notification.create({
      user: userId,
      type: "streak_alert",
      title: `🔥 ${stats.streak}-Day Streak!`,
      body: `Incredible! You've maintained a ${stats.streak}-day streak. +${XP_REWARDS.streak_milestone} XP bonus!`,
      metadata: { streak: stats.streak },
    });
  }

  await stats.save();
  return stats.streak;
};

module.exports = { awardXP, updateStreak, getOrCreateStats };
