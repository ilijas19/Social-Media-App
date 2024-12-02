const User = require("../model/User");
const Chat = require("../model/Chat");
const Message = require("../model/Message");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");

const createChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    throw new CustomError.BadRequestError("User id needs to be provided");
  }
  if (userId === req.user.userId) {
    throw new CustomError.BadRequestError("Cant start chat with yourself");
  }
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new CustomError.NotFoundError(
      `User with id: ${userId} was not found`
    );
  }
  const isFollowed = user.followers.includes(req.user.userId);
  if (!isFollowed) {
    throw new CustomError.BadRequestError(
      "You must follow user in order to start chat with him"
    );
  }

  const existingChat = await Chat.findOne({
    users: { $all: [userId, req.user.userId] },
  });

  if (existingChat) {
    return res
      .status(StatusCodes.OK)
      .json({ msg: "Existing Chat", existingChat });
  }
  const chat = await Chat.create({ users: [req.user.userId, user._id] });
  res.status(StatusCodes.CREATED).json({ chat });
};

const getAllChats = async (req, res) => {
  const chats = await Chat.find({
    users: { $all: [req.user.userId] },
  }).populate({
    path: "users",
    select: "username",
  });
  res.status(StatusCodes.OK).json({ chats });
};

const sendMessage = async (req, res) => {
  const { id: chatId } = req.params;
  const { text } = req.body;
  if (!text || !chatId) {
    throw new CustomError.BadRequestError("All credientials must be provided");
  }

  const chat = await Chat.findOne({ _id: chatId });

  if (!chat.users.includes(req.user.userId)) {
    throw new CustomError.BadRequestError("Not part of that chat");
  }

  if (!chat) {
    throw new CustomError.NotFoundError(`No chat with id: ${chatId}`);
  }
  const message = await Message.create({
    senderId: req.user.userId,
    chatId,
    text,
  });
  chat.messages.push(message._id);
  await chat.save();

  res.status(StatusCodes.CREATED).json({ msg: "Message Sent", message, chat });
};

const getChatMessages = async (req, res) => {
  const { id: chatId } = req.params;
  if (!chatId) {
    throw new CustomError.BadRequestError("Chat id needs to be provided");
  }
  const chat = await Chat.findOne({ _id: chatId }).populate({
    path: "messages",
    select: "text status senderId",
    populate: {
      path: "senderId",
      select: "username",
    },
  });
  if (!chat) {
    throw new CustomError.NotFoundError(`No chat with id:${chatId}`);
  }
  if (!chat.users.includes(req.user.userId)) {
    throw new CustomError.BadRequestError("Not part of that chat");
  }
  res.status(StatusCodes.OK).json({ messages: chat.messages });
};

const markMessagesAsRead = async (req, res) => {
  res.send("mark messages");
};

const deleteChat = async (req, res) => {
  const { id: chatId } = req.params;
  if (!chatId) {
    throw new CustomError.BadRequestError("Chat id needs to be provided");
  }
  const chat = await Chat.findOne({ _id: chatId });
  if (!chat) {
    throw new CustomError.NotFoundError(`No chat with id: ${chatId}`);
  }
  if (!chat.users.includes(req.user.userId)) {
    throw new CustomError.BadRequestError("Not part of that chat");
  }
  await chat.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "Chat Deleted" });
};

module.exports = {
  createChat,
  getAllChats,
  sendMessage,
  getChatMessages,
  markMessagesAsRead,
  deleteChat,
};
