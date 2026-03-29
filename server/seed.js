const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Workout = require("./models/Workout");
const Diet = require("./models/Diet");
const { getWorkoutTemplate, getDietTemplate } = require("./utils/personalizationEngine");

dotenv.config();

const genders = ["male", "female"];
const goals = ["weight_loss", "weight_gain", "fitness"];
const levels = ["beginner", "intermediate"];
const categories = ["home", "gym"];

const buildWorkoutSeeds = () => {
  const workouts = [];
  genders.forEach((gender) => {
    goals.forEach((goal) => {
      levels.forEach((level) => {
        categories.forEach((category) => {
          const template = getWorkoutTemplate({ gender, goal, level, category });
          if (template) {
            workouts.push({
              title: template.title,
              gender,
              goal,
              level,
              category,
              exercises: template.exercises,
            });
          }
        });
      });
    });
  });
  return workouts;
};

const buildDietSeeds = () => {
  const diets = [];
  genders.forEach((gender) => {
    goals.forEach((goal) => {
      const meals = getDietTemplate({ gender, goal });
      if (meals) diets.push({ gender, goal, meals });
    });
  });
  return diets;
};

const runSeed = async () => {
  try {
    await connectDB();
    await Workout.deleteMany({});
    await Diet.deleteMany({});

    const workouts = buildWorkoutSeeds();
    const diets = buildDietSeeds();

    await Workout.insertMany(workouts);
    await Diet.insertMany(diets);

    // eslint-disable-next-line no-console
    console.log(`Seed complete: ${workouts.length} workouts, ${diets.length} diet plans`);
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

runSeed();
