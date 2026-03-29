const { generatePersonalizedPlan } = require("../utils/personalizationEngine");

const getAiRecommendationStub = ({ goal, gender }) => {
  const focusMap = {
    weight_loss: "Focus on daily calorie deficit, steps, and progressive cardio blocks.",
    weight_gain: "Prioritize progressive overload and protein-rich meals every 3-4 hours.",
    fitness: "Blend mobility, strength, and recovery for sustainable fitness gains.",
  };

  return {
    summary: focusMap[goal] || "Build consistency in workouts and nutrition.",
    suggestedIntensity: goal === "weight_gain" ? "moderate-high" : "moderate",
    suggestions: [
      `Plan your weekly schedule around ${goal.replace("_", " ")} goals.`,
      `Track weight and adherence for ${gender}-specific adaptation.`,
      "Sleep 7-8 hours and hydrate consistently.",
    ],
  };
};

module.exports = { generatePersonalizedPlan, getAiRecommendationStub };
