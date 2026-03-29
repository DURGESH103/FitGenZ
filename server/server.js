const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const connectDB = require("./config/db");
const app = require("./app");
const { initSocket } = require("./config/socket");
const logger = require("./utils/logger");

connectDB();

const httpServer = http.createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
