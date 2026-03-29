const UserStats   = require("../models/UserStats");
const Notification = require("../models/Notification");
const EVENTS      = require("../config/events");

const XP_REWARDS = {
  task_complete:    20,
  all_tasks_done:   50,
  progress_logged:  30,
  streak_milestone: 100,
  workout_logged:   40,
  daily_reward:     75,
};

const DAILY_REWARD_STREAK_BONUS = 25; // extra XP per 7-day streak tier

const BADGE_RULES = [
  { id: "first_login",   icon: "🎯", label: "First Login",   check: (s) => s.totalTasksDone >= 1    },
  { id: "week_warrior",  icon: "🔥", label: "Week Warrior",  check: (s) => s.streak >= 7            },
  { id: "iron_will",     icon: "💪", label: "Iron Will",     check: (s) => s.streak >= 14           },
  { id: "diet_master",   icon: "🥗", label: "Diet Master",   check: (s) => s.totalTasksDone >= 30   },
  { id: "consistency",   icon: "⚡", label: "Consistent",    check: (s) => s.streak >= 21           },
  { id: "goal_crusher",  icon: "🏆", label: "Goal Crusher",  check: (s) => s.totalWorkouts >= 50    },
  { id: "century_club",  icon: "💯", label: "Century Club",  check: (s) => s.totalTasksDone >= 100  },
  { id: "xp_500",        icon: "⭐", label: "XP Hunter",     check: (s) => s.xp >= 500              },
  { id: "xp_1000",       icon: "🌟", label: "XP Master",     check: (s) => s.xp >= 1000             },
];

const getOrCreateStats = async (userId) => {
  let stats = await UserStats.findOne({ user: userId });
  if (!stats) stats = await UserStats.create({ user: userId });
  return stats;
};

const checkAndAwardBadges = (stats) => {
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
  const sorted = [...UserStats.LEVELS].sort((a, b) => b.xpRequired - a.xpRequired);
  return sorted.find((l) => xp >= l.xpRequired) || UserStats.LEVELS[0];
};

/** Reset weeklyXP every Monday */
const maybeResetWeeklyXP = (stats) => {
  const now    = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // last Monday
  monday.setHours(0, 0, 0, 0);

  if (!stats.weeklyXPReset || new Date(stats.weeklyXPReset) < monday) {
    stats.weeklyXP      = 0;
    stats.weeklyXPReset = monday;
  }
};

/**
 * Award XP. Returns { stats, leveledUp, newBadges, xpGain }
 */
const awardXP = async (userId, action, extra = {}) => {
  const xpGain = XP_REWARDS[action] || 0;
  if (xpGain === 0) return null;

  const stats     = await getOrCreateStats(userId);
  const prevLevel = stats.level;

  maybeResetWeeklyXP(stats);

  stats.xp       += xpGain;
  stats.weeklyXP += xpGain;
  if (extra.incrementWorkouts) stats.totalWorkouts  += 1;
  if (extra.incrementTasks)    stats.totalTasksDone += 1;

  const newLevelInfo = getLevelFromXP(stats.xp);
  stats.level      = newLevelInfo.level;
  stats.levelTitle = newLevelInfo.title;

  const newBadges = checkAndAwardBadges(stats);
  await stats.save();

  const leveledUp = stats.level > prevLevel;

  if (leveledUp) {
    await Notification.create({
      user:  userId,
      type:  "level_up",
      title: "Level Up! 🎉",
      body:  `You reached Level ${stats.level} — ${stats.levelTitle}!`,
      metadata: { level: stats.level, title: stats.levelTitle },
    });
  }

  for (const badge of newBadges) {
    await Notification.create({
      user:  userId,
      type:  "badge_earned",
      title: `Badge Unlocked: ${badge.label} ${badge.icon}`,
      body:  `You earned the "${badge.label}" badge!`,
      metadata: badge,
    });
  }

  return { stats, leveledUp, newBadges, newLevel: leveledUp ? newLevelInfo : null, xpGain };
};

/**
 * Update streak. Consumes a freeze token if the user missed yesterday.
 * Returns { streak, usedFreeze, streakBroken }
 */
const updateStreak = async (userId) => {
  const stats   = await getOrCreateStats(userId);
  const today   = new Date().toISOString().slice(0, 10);
  const lastDate = stats.lastActivityDate
    ? new Date(stats.lastActivityDate).toISOString().slice(0, 10)
    : null;

  if (lastDate === today) return { streak: stats.streak, usedFreeze: false, streakBroken: false };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  let usedFreeze   = false;
  let streakBroken = false;

  if (lastDate === yStr) {
    // Consecutive day — normal increment
    stats.streak += 1;
  } else if (lastDate) {
    // Missed a day — try to use a freeze token
    if (stats.streakFreezes > 0) {
      stats.streakFreezes -= 1;
      stats.streak        += 1;
      usedFreeze = true;
      await Notification.create({
        user:  userId,
        type:  "streak_alert",
        title: "❄️ Streak Freeze Used!",
        body:  `A streak freeze protected your ${stats.streak}-day streak. ${stats.streakFreezes} freeze(s) remaining.`,
        metadata: { streak: stats.streak, freezesLeft: stats.streakFreezes },
      });
    } else {
      stats.streak = 1;
      streakBroken = true;
    }
  } else {
    stats.streak = 1;
  }

  stats.lastActivityDate = new Date();
  if (stats.streak > stats.longestStreak) stats.longestStreak = stats.streak;

  // Streak milestone XP
  if ([7, 14, 21, 30, 60, 100].includes(stats.streak)) {
    stats.xp       += XP_REWARDS.streak_milestone;
    stats.weeklyXP += XP_REWARDS.streak_milestone;
    const newLevelInfo = getLevelFromXP(stats.xp);
    stats.level      = newLevelInfo.level;
    stats.levelTitle = newLevelInfo.title;
    // Award a freeze token at milestones
    if (stats.streakFreezes < 3) stats.streakFreezes += 1;
    await Notification.create({
      user:  userId,
      type:  "streak_alert",
      title: `🔥 ${stats.streak}-Day Streak!`,
      body:  `Incredible! ${stats.streak}-day streak. +${XP_REWARDS.streak_milestone} XP bonus! You earned a streak freeze.`,
      metadata: { streak: stats.streak },
    });
  }

  await stats.save();
  return { streak: stats.streak, usedFreeze, streakBroken };
};

/**
 * Claim daily reward. Returns { xpGain, streakBonus, alreadyClaimed }
 */
const claimDailyReward = async (userId) => {
  const stats = await getOrCreateStats(userId);

  if (!stats.canClaimDailyReward()) {
    return { alreadyClaimed: true, xpGain: 0, streakBonus: 0 };
  }

  maybeResetWeeklyXP(stats);

  const streakTier  = Math.floor(stats.streak / 7);
  const streakBonus = streakTier * DAILY_REWARD_STREAK_BONUS;
  const xpGain      = XP_REWARDS.daily_reward + streakBonus;

  stats.xp                  += xpGain;
  stats.weeklyXP            += xpGain;
  stats.dailyRewardClaimedAt = new Date();

  const newLevelInfo = getLevelFromXP(stats.xp);
  stats.level      = newLevelInfo.level;
  stats.levelTitle = newLevelInfo.title;

  const newBadges = checkAndAwardBadges(stats);
  await stats.save();

  return {
    alreadyClaimed: false,
    xpGain,
    streakBonus,
    stats,
    leveledUp: false,
    newBadges,
  };
};

module.exports = { awardXP, updateStreak, getOrCreateStats, claimDailyReward, XP_REWARDS };
