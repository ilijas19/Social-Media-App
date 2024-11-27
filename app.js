require("express-async-errors");
require("dotenv").config();

const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const socket = socketIO(server);
const cookieParser = require("cookie-parser");
//DB
const connectDb = require("./db/connectDb");
//ROUTERS
const authRouter = require("./routes/authRoutes");
//MIDDLEWARES
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
//APP
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.use("/api/v1/auth", authRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI);
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {}
};
start();
