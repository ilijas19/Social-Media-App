require("express-async-errors");
require("dotenv").config();

const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
//packages
const io = socketIO(server);
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
//DB
const connectDb = require("./db/connectDb");
//ROUTERS
const authRouter = require("./routes/authRoutes");
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");
const profileRouter = require("./routes/profileRoutes");
const commentRouter = require("./routes/commentRoutes");
const chatRouter = require("./routes/chatRoutes");
const navigationRouter = require("./routes/navigationRoutes");

//MIDDLEWARES
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
//APP
app.use(express.json());
app.use(express.query());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.use("/", navigationRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/chat", chatRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const {
  userJoin,
  userLeave,
  getOnlineUsers,
  joinRoom,
  leaveRoom,
} = require("./utils/socketUsers");
const start = async () => {
  try {
    io.on("connection", (socket) => {
      socket.emit("join", { id: socket.id });

      socket.on("joinFromClient", (data) => {
        userJoin(data.currentUser);
      });

      socket.on("joinRoom", (data) => {
        joinRoom(socket, data.chatId);
        console.log(data, "joinRoom");
      });

      socket.on("messageFromClient", (data) => {
        const { message, room } = data;
        io.to(room).emit("messageFromServer", message);
      });

      socket.on("leaveRoom", () => {
        leaveRoom(socket);
        console.log(socket.id, "leave room");
      });

      socket.on("disconnect", () => {
        userLeave(socket.id);
      });
    });

    await connectDb(process.env.MONGO_URI);
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {}
};
start();
