const asyncHandler = require("../utils/asyncHandler");
const OpenAI = require("openai");

let _openaiClient = null;
const getClient = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!_openaiClient) _openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openaiClient;
};

const recommend = asyncHandler(async (req, res) => {
  const goal = req.query.goal || req.user.goal;
  const userPrompt = req.query.prompt || '';
  const client = getClient();
  if (!client) {
    return res.status(400).json({ message: "OPENAI_API_KEY is not configured" });
  }

  const prompt = [
    "You are a fitness AI assistant for Indian users.",
    `User gender: ${req.user.gender}`,
    `User goal: ${goal}`,
    `Age: ${req.user.age}, Height: ${req.user.height}cm, Weight: ${req.user.weight}kg`,
    userPrompt ? `User question: ${userPrompt}` : "",
    "Return JSON with keys: workoutSuggestion (string), dietSuggestion (string), caution (string).",
    "Keep suggestions practical, safe, and budget-friendly.",
  ].filter(Boolean).join("\n");

  const completion = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    input: prompt,
  });

  const outputText =
    completion.output_text || "Unable to parse AI output. Please retry with clearer profile context.";

  return res.status(200).json({
    message: "AI recommendation generated",
    userContext: {
      userId: req.user._id,
      gender: req.user.gender,
      goal,
    },
    recommendation: outputText,
  });
});

module.exports = { recommend };
