const express = require("express");
const router = express.Router();

const {
  authenticateUser,
  authorizePermission,
} = require("../middlewares/authentication");

// /api/v1/chat
const {
  createChat, // '/'
  getAllChats, // '/'
  sendMessage, // '/:id'
  getChatMessages, // '/:id'
  markMessagesAsRead,
  deleteChat, // :id
} = require("../controllers/chatController");

router
  .route("/")
  .post(authenticateUser, createChat)
  .get(authenticateUser, getAllChats);

router
  .route("/:id")
  .post(authenticateUser, sendMessage)
  .get(authenticateUser, getChatMessages)
  .patch(authenticateUser, markMessagesAsRead)
  .delete(authenticateUser, deleteChat);

module.exports = router;
