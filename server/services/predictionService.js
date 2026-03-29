/**
 * Linear regression on weight history to predict goal completion date.
 * Returns { estimatedDays, estimatedDate, weeklyRate, confidence }
 */
const predictGoalCompletion = (history, user) => {
  if (!history || history.length < 2) {
    return { estimatedDays: null, estimatedDate: null, weeklyRate: null, confidence: "low" };
  }

  // Sort ascending by date
  const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Build (x = days from first entry, y = weight) pairs
  const t0 = new Date(sorted[0].date).getTime();
  const points = sorted.map((p) => ({
    x: (new Date(p.date).getTime() - t0) / (1000 * 60 * 60 * 24),
    y: p.weight,
  }));

  // Least-squares linear regression
  const n = points.length;
  const sumX  = points.reduce((s, p) => s + p.x, 0);
  const sumY  = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumX2 - sumX * sumX;

  if (denom === 0) {
    return { estimatedDays: null, estimatedDate: null, weeklyRate: null, confidence: "low" };
  }

  const slope     = (n * sumXY - sumX * sumY) / denom; // kg/day
  const intercept = (sumY - slope * sumX) / n;

  const currentWeight = sorted[sorted.length - 1].weight;
  const weeklyRate    = +(slope * 7).toFixed(2); // kg/week

  // Determine target weight based on goal
  let targetWeight = null;
  const { goal, weight: startWeight } = user;
  if (goal === "weight_loss")  targetWeight = startWeight * 0.85; // 15% loss target
  if (goal === "weight_gain")  targetWeight = startWeight * 1.10; // 10% gain target
  if (goal === "fitness")      targetWeight = currentWeight;       // maintenance

  if (targetWeight === null || slope === 0) {
    return { estimatedDays: null, estimatedDate: null, weeklyRate, confidence: "low" };
  }

  // Days to reach target from current trend
  const daysToTarget = (targetWeight - intercept) / slope;
  const daysFromNow  = Math.round(daysToTarget - points[points.length - 1].x);

  if (daysFromNow <= 0 || daysFromNow > 730) {
    return {
      estimatedDays: null,
      estimatedDate: null,
      weeklyRate,
      confidence: daysFromNow <= 0 ? "achieved" : "low",
    };
  }

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + daysFromNow);

  const confidence = n >= 10 ? "high" : n >= 5 ? "medium" : "low";

  return {
    estimatedDays: daysFromNow,
    estimatedDate: estimatedDate.toISOString().slice(0, 10),
    weeklyRate,
    targetWeight: +targetWeight.toFixed(1),
    confidence,
  };
};

/**
 * Calculate goal completion percentage based on weight progress.
 */
const calcGoalProgress = (history, user) => {
  if (!history || history.length === 0) return 0;
  const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  const startW   = sorted[0].weight;
  const currentW = sorted[sorted.length - 1].weight;
  const { goal } = user;

  if (goal === "weight_loss") {
    const target = startW * 0.85;
    if (startW <= target) return 100;
    return Math.min(Math.round(((startW - currentW) / (startW - target)) * 100), 100);
  }
  if (goal === "weight_gain") {
    const target = startW * 1.10;
    if (currentW >= target) return 100;
    return Math.min(Math.round(((currentW - startW) / (target - startW)) * 100), 100);
  }
  // fitness — based on consistency (streak-based, handled elsewhere)
  return 0;
};

module.exports = { predictGoalCompletion, calcGoalProgress };
