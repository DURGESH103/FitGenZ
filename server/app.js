const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const dietRoutes = require("./routes/dietRoutes");
const progressRoutes = require("./routes/progressRoutes");
const taskRoutes = require("./routes/taskRoutes");
const aiRoutes = require("./routes/aiRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const gamificationRoutes = require("./routes/gamificationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { apiLimiter, authLimiter } = require("./middleware/rateLimitMiddleware");
const { cacheByQuery } = require("./middleware/cacheMiddleware");
const requestLogger = require("./middleware/requestLogger");
const xssMiddleware = require("./middleware/xssMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  })
);
app.use(apiLimiter);
app.use(xssMiddleware);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(requestLogger);
}

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "YouthFit AI API" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/workout", cacheByQuery("workout", 90), workoutRoutes);
app.use("/api/diet", cacheByQuery("diet", 120), dietRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics",     analyticsRoutes);
app.use("/api/gamification",  gamificationRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
