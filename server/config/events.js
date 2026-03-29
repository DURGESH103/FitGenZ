/**
 * Canonical socket event names.
 * Import this everywhere instead of using raw strings.
 */
const EVENTS = {
  // Gamification
  XP_GAINED:        "XP_GAINED",
  LEVEL_UP:         "LEVEL_UP",
  BADGE_EARNED:     "BADGE_EARNED",
  STATS_UPDATE:     "STATS_UPDATE",

  // Tasks
  TASK_COMPLETED:   "TASK_COMPLETED",
  TASKS_ALL_DONE:   "TASKS_ALL_DONE",

  // Progress
  PROGRESS_ADDED:   "PROGRESS_ADDED",

  // Streak
  STREAK_UPDATED:   "STREAK_UPDATED",
  STREAK_MILESTONE: "STREAK_MILESTONE",

  // Daily reward
  DAILY_REWARD:     "DAILY_REWARD",

  // Social feed
  FEED_NEW_POST:    "feed:new_post",
  FEED_LIKE:        "feed:like_update",
  FEED_COMMENT:     "feed:comment_added",
};

module.exports = EVENTS;
