const { calculateDailyCalories } = require("./calorieCalculator");

const workoutTemplates = {
  male: {
    weight_loss: {
      beginner: {
        home: {
          title: "Male Fat-Loss Home Starter",
          exercises: [
            { name: "Bodyweight Squat", sets: 3, reps: "15" },
            { name: "Push-Ups", sets: 3, reps: "10-12" },
            { name: "Mountain Climbers", sets: 4, reps: "30 sec" },
          ],
        },
        gym: {
          title: "Male Fat-Loss Gym Starter",
          exercises: [
            { name: "Barbell Squat", sets: 4, reps: "8-10" },
            { name: "Bench Press", sets: 4, reps: "8-10" },
            { name: "Row Machine", sets: 3, reps: "12" },
          ],
        },
      },
      intermediate: {
        home: {
          title: "Male Fat-Loss Home Intermediate",
          exercises: [
            { name: "Burpees", sets: 4, reps: "15" },
            { name: "Jump Squats", sets: 4, reps: "15" },
            { name: "Plank", sets: 4, reps: "60 sec" },
          ],
        },
        gym: {
          title: "Male Fat-Loss Gym Intermediate",
          exercises: [
            { name: "Deadlift", sets: 4, reps: "6-8" },
            { name: "Incline Dumbbell Press", sets: 4, reps: "10" },
            { name: "Battle Rope", sets: 5, reps: "45 sec" },
          ],
        },
      },
    },
    weight_gain: {
      beginner: {
        home: {
          title: "Male Muscle Gain Home Starter",
          exercises: [
            { name: "Elevated Push-Ups", sets: 4, reps: "12" },
            { name: "Chair Dips", sets: 4, reps: "12" },
            { name: "Split Squat", sets: 4, reps: "12 each leg" },
          ],
        },
        gym: {
          title: "Male Muscle Gain Gym Starter",
          exercises: [
            { name: "Deadlift", sets: 5, reps: "5-6" },
            { name: "Bench Press", sets: 5, reps: "6-8" },
            { name: "Barbell Row", sets: 4, reps: "8-10" },
          ],
        },
      },
      intermediate: {
        home: {
          title: "Male Hypertrophy Home Intermediate",
          exercises: [
            { name: "Backpack Squats", sets: 5, reps: "15" },
            { name: "Feet Elevated Push-Ups", sets: 5, reps: "15" },
            { name: "Pike Push-Ups", sets: 4, reps: "12" },
          ],
        },
        gym: {
          title: "Male Hypertrophy Gym Intermediate",
          exercises: [
            { name: "Front Squat", sets: 5, reps: "6-8" },
            { name: "Incline Dumbbell Press", sets: 4, reps: "8-10" },
            { name: "Barbell Bicep Curl", sets: 4, reps: "10-12" },
          ],
        },
      },
    },
    fitness: {
      beginner: {
        home: {
          title: "Male Functional Fitness Home Starter",
          exercises: [
            { name: "Jumping Jacks", sets: 4, reps: "45 sec" },
            { name: "Bodyweight Lunges", sets: 3, reps: "12 each leg" },
            { name: "Plank", sets: 3, reps: "45 sec" },
          ],
        },
        gym: {
          title: "Male Functional Fitness Gym Starter",
          exercises: [
            { name: "Kettlebell Swings", sets: 4, reps: "15" },
            { name: "Goblet Squats", sets: 4, reps: "12" },
            { name: "Assault Bike", sets: 5, reps: "60 sec" },
          ],
        },
      },
      intermediate: {
        home: {
          title: "Male Functional Fitness Home Intermediate",
          exercises: [
            { name: "Burpees", sets: 4, reps: "12" },
            { name: "Hollow Holds", sets: 4, reps: "40 sec" },
            { name: "Skater Jumps", sets: 4, reps: "20" },
          ],
        },
        gym: {
          title: "Male Functional Fitness Gym Intermediate",
          exercises: [
            { name: "Farmer's Walk", sets: 4, reps: "40 meters" },
            { name: "Sled Push", sets: 5, reps: "25 meters" },
            { name: "Hanging Knee Raise", sets: 4, reps: "15" },
          ],
        },
      },
    },
  },
  female: {
    weight_loss: {
      beginner: {
        home: {
          title: "Female Fat-Loss Home Starter",
          exercises: [
            { name: "Glute Bridge", sets: 4, reps: "15" },
            { name: "Bodyweight Squat", sets: 4, reps: "15" },
            { name: "Marching Plank", sets: 3, reps: "30 sec" },
          ],
        },
        gym: {
          title: "Female Fat-Loss Gym Starter",
          exercises: [
            { name: "Hip Thrust", sets: 4, reps: "12" },
            { name: "Walking Lunges", sets: 3, reps: "12 each leg" },
            { name: "Treadmill Incline Walk", sets: 4, reps: "8 min" },
          ],
        },
      },
      intermediate: {
        home: {
          title: "Female Fat-Loss Home Intermediate",
          exercises: [
            { name: "Jump Rope", sets: 5, reps: "60 sec" },
            { name: "Reverse Lunges", sets: 4, reps: "14 each leg" },
            { name: "Russian Twists", sets: 4, reps: "24" },
          ],
        },
        gym: {
          title: "Female Fat-Loss Gym Intermediate",
          exercises: [
            { name: "Romanian Deadlift", sets: 4, reps: "10" },
            { name: "Leg Press", sets: 4, reps: "12" },
            { name: "Rowing Machine Intervals", sets: 5, reps: "2 min" },
          ],
        },
      },
    },
    weight_gain: {
      beginner: {
        home: {
          title: "Female Lean Gain Home Starter",
          exercises: [
            { name: "Glute Bridge Hold", sets: 4, reps: "40 sec" },
            { name: "Incline Push-Ups", sets: 4, reps: "10-12" },
            { name: "Step-Ups", sets: 4, reps: "12 each leg" },
          ],
        },
        gym: {
          title: "Female Lean Gain Gym Starter",
          exercises: [
            { name: "Hip Thrust", sets: 4, reps: "10-12" },
            { name: "Dumbbell Shoulder Press", sets: 3, reps: "10-12" },
            { name: "Seated Row", sets: 3, reps: "12" },
          ],
        },
      },
      intermediate: {
        home: {
          title: "Female Lean Gain Home Intermediate",
          exercises: [
            { name: "Bulgarian Split Squat", sets: 4, reps: "12 each leg" },
            { name: "Pike Push-Up", sets: 4, reps: "10" },
            { name: "Tempo Squats", sets: 4, reps: "14" },
          ],
        },
        gym: {
          title: "Female Lean Gain Gym Intermediate",
          exercises: [
            { name: "Barbell Hip Thrust", sets: 5, reps: "8-10" },
            { name: "Romanian Deadlift", sets: 4, reps: "8-10" },
            { name: "Lat Pulldown", sets: 4, reps: "10-12" },
          ],
        },
      },
    },
    fitness: {
      beginner: {
        home: {
          title: "Female Fitness Home Starter",
          exercises: [
            { name: "Cycling (Stationary)", sets: 4, reps: "8 min" },
            { name: "Donkey Kicks", sets: 3, reps: "15 each leg" },
            { name: "Plank With Shoulder Tap", sets: 3, reps: "16" },
          ],
        },
        gym: {
          title: "Female Fitness Gym Starter",
          exercises: [
            { name: "Elliptical", sets: 4, reps: "10 min" },
            { name: "Cable Kickback", sets: 3, reps: "12 each leg" },
            { name: "Assisted Pull-Up", sets: 3, reps: "8-10" },
          ],
        },
      },
      intermediate: {
        home: {
          title: "Female Fitness Home Intermediate",
          exercises: [
            { name: "High Knees", sets: 5, reps: "45 sec" },
            { name: "Single-Leg Glute Bridge", sets: 4, reps: "12 each leg" },
            { name: "Burpees", sets: 4, reps: "12" },
          ],
        },
        gym: {
          title: "Female Fitness Gym Intermediate",
          exercises: [
            { name: "Rower", sets: 5, reps: "2 min" },
            { name: "Kettlebell Deadlift", sets: 4, reps: "12" },
            { name: "Medicine Ball Slams", sets: 4, reps: "12" },
          ],
        },
      },
    },
  },
};

const dietTemplates = {
  male: {
    weight_loss: [
      { time: "7:30 AM", name: "Oats + whey + banana", calories: 380, protein: 28 },
      { time: "10:30 AM", name: "Boiled eggs + black tea", calories: 220, protein: 18 },
      { time: "1:30 PM", name: "2 roti + dal + grilled chicken", calories: 520, protein: 42 },
      { time: "5:00 PM", name: "Roasted chana + buttermilk", calories: 180, protein: 10 },
      { time: "8:00 PM", name: "Paneer bhurji + salad", calories: 450, protein: 34 },
    ],
    weight_gain: [
      { time: "7:30 AM", name: "Paneer paratha + curd", calories: 650, protein: 28 },
      { time: "11:00 AM", name: "Banana shake + peanuts", calories: 500, protein: 18 },
      { time: "2:00 PM", name: "Rice + rajma + chicken curry", calories: 780, protein: 45 },
      { time: "5:30 PM", name: "Sprouts chaat + lassi", calories: 360, protein: 16 },
      { time: "9:00 PM", name: "Roti + paneer tikka + dal", calories: 700, protein: 42 },
    ],
    fitness: [
      { time: "7:30 AM", name: "Poha + boiled eggs", calories: 420, protein: 22 },
      { time: "11:00 AM", name: "Fruit bowl + almonds", calories: 250, protein: 8 },
      { time: "2:00 PM", name: "2 roti + mixed dal + fish", calories: 600, protein: 36 },
      { time: "5:00 PM", name: "Sattu drink", calories: 220, protein: 12 },
      { time: "8:30 PM", name: "Khichdi + curd + salad", calories: 500, protein: 20 },
    ],
  },
  female: {
    weight_loss: [
      { time: "7:30 AM", name: "Vegetable upma + chia water", calories: 300, protein: 10 },
      { time: "10:30 AM", name: "Apple + roasted makhana", calories: 170, protein: 5 },
      { time: "1:30 PM", name: "1 roti + dal + sabzi + salad", calories: 430, protein: 16 },
      { time: "5:00 PM", name: "Moong chilla (2)", calories: 240, protein: 14 },
      { time: "8:00 PM", name: "Grilled paneer + sauteed veggies", calories: 390, protein: 24 },
    ],
    weight_gain: [
      { time: "7:30 AM", name: "Besan chilla + paneer stuffing", calories: 480, protein: 26 },
      { time: "11:00 AM", name: "Dates smoothie + nuts", calories: 360, protein: 12 },
      { time: "2:00 PM", name: "Rice + chole + curd", calories: 650, protein: 22 },
      { time: "5:30 PM", name: "Peanut chaat + coconut water", calories: 300, protein: 11 },
      { time: "9:00 PM", name: "2 roti + soya curry + salad", calories: 560, protein: 28 },
    ],
    fitness: [
      { time: "7:30 AM", name: "Idli sambar + sprouts", calories: 360, protein: 14 },
      { time: "11:00 AM", name: "Guava + pumpkin seeds", calories: 190, protein: 7 },
      { time: "2:00 PM", name: "Millet roti + dal + bhindi", calories: 500, protein: 18 },
      { time: "5:00 PM", name: "Greek yogurt + berries", calories: 220, protein: 12 },
      { time: "8:30 PM", name: "Quinoa pulao + tofu stir fry", calories: 460, protein: 24 },
    ],
  },
};

const getWorkoutTemplate = ({ gender, goal, level = "beginner", category = "home" }) => {
  return workoutTemplates[gender]?.[goal]?.[level]?.[category] || null;
};

const getDietTemplate = ({ gender, goal }) => {
  return dietTemplates[gender]?.[goal] || null;
};

const generatePersonalizedPlan = ({ gender, age, height, weight, goal, level, category }) => {
  const calories = calculateDailyCalories({ gender, age, height, weight, goal });
  const workout = getWorkoutTemplate({ gender, goal, level, category });
  const diet = getDietTemplate({ gender, goal });

  return { calories, workout, diet };
};

module.exports = {
  getWorkoutTemplate,
  getDietTemplate,
  generatePersonalizedPlan,
};
