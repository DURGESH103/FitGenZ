const calculateDailyCalories = ({ gender, age, height, weight, goal }) => {
  if (!["male", "female"].includes(gender)) {
    throw new Error("Invalid gender for calorie calculation");
  }

  // Mifflin-St Jeor equations
  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const maintenanceCalories = Math.round(bmr * 1.4);

  if (goal === "weight_loss") return Math.round(maintenanceCalories - 400);
  if (goal === "weight_gain") return Math.round(maintenanceCalories + 350);
  return maintenanceCalories;
};

module.exports = { calculateDailyCalories };
