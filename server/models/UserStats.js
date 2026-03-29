const mongoose = require("mongoose");

const LEVELS = [
  { level: 1,  title: "Rookie",       xpRequired: 0    },
  { level: 2,  title: "Challenger",   xpRequired: 100  },
  { level: 3,  title: "Athlete",      xpRequired: 300  },
  { level: 4,  title: "Warrior",      xpRequired: 600  },
  { level: 5,  title: "Champion",     xpRequired: 1000 },
  { level: 6,  title: "Legend",       xpRequired: 1500 },
  { level: 7,  title: "Elite",        xpRequired: 2200 },
  { level: 8,  title: "Master",       xpRequired: 3000 },
  { level: 9,  title: "Grandmaster",  xpRequired: 4000 },
  { level: 10, title: "God Mode",     xpRequired: 5500 },
];

const badgeSchema = new mongoose.Schema(
  {
    id:       { type: String, required: true },
    label:    { type: String, required: true },
    icon:     { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userStatsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    xp:             { type: Number, default: 0, min: 0 },
    weeklyXP:       { type: Number, default: 0, min: 0 }, // resets every Monday
    weeklyXPReset:  { type: Date, default: null },
    level:          { type: Number, default: 1, min: 1 },
    levelTitle:     { type: String, default: "Rookie" },
    streak:         { type: Number, default: 0, min: 0 },
    longestStreak:  { type: Number, default: 0, min: 0 },
    streakFreezes:  { type: Number, default: 1, min: 0, max: 3 }, // streak protection tokens
    totalWorkouts:  { type: Number, default: 0, min: 0 },
    totalTasksDone: { type: Number, default: 0, min: 0 },
    badges:         { type: [badgeSchema], default: [] },
    lastActivityDate:     { type: Date, default: null },
    dailyRewardClaimedAt: { type: Date, default: null }, // last daily reward claim
    pushSubscription:     { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

userStatsSchema.statics.LEVELS = LEVELS;

userStatsSchema.methods.getLevelInfo = function () {
  const sorted  = [...LEVELS].sort((a, b) => b.xpRequired - a.xpRequired);
  const current = sorted.find((l) => this.xp >= l.xpRequired) || LEVELS[0];
  const nextIdx = LEVELS.findIndex((l) => l.level === current.level + 1);
  const next    = nextIdx !== -1 ? LEVELS[nextIdx] : null;
  const xpIntoLevel = this.xp - current.xpRequired;
  const xpNeeded    = next ? next.xpRequired - current.xpRequired : 1;
  return {
    level:      current.level,
    title:      current.title,
    xp:         this.xp,
    weeklyXP:   this.weeklyXP,
    xpIntoLevel,
    xpNeeded,
    progressPct: Math.min(Math.round((xpIntoLevel / xpNeeded) * 100), 100),
    next:        next ? next.title : null,
  };
};

/** Returns true if daily reward is available (not claimed today) */
userStatsSchema.methods.canClaimDailyReward = function () {
  if (!this.dailyRewardClaimedAt) return true;
  const today = new Date().toISOString().slice(0, 10);
  const last  = new Date(this.dailyRewardClaimedAt).toISOString().slice(0, 10);
  return today !== last;
};

module.exports = mongoose.model("UserStats", userStatsSchema);
