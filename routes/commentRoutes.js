const express = require("express");
const router = express.Router();

const {
  authorizePermission,
  authenticateUser,
} = require("../middlewares/authentication");

// /api/v1/comment
const {
  createComment, // '/:id'
  editComment, // '/:id'
  deleteComment, // '/:id'
  getCommentsFromPost, //:id
} = require("../controllers/commentController");

router
  .route("/:id")
  .get(authenticateUser, getCommentsFromPost)
  .post(authenticateUser, createComment)
  .patch(authenticateUser, editComment)
  .delete(authenticateUser, deleteComment);

module.exports = router;
