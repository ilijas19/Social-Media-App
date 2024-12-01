const Comment = require("../model/Comment");
const User = require("../model/User");
const Post = require("../model/Post");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");

const createComment = async (req, res) => {
  const { id: postId } = req.params;
  const { text } = req.body;
  if (!postId) {
    throw new CustomError.BadRequestError("Post id needs to be provided");
  }
  if (!text) {
    throw new CustomError.BadRequestError("Comment text must be provided");
  }
  const post = await Post.findOne({ _id: postId });
  if (!post) {
    throw new CustomError.NotFoundError(`No post with id: ${postId}`);
  }

  const comment = await Comment.create({
    postId,
    userId: req.user.userId,
    text,
  });
  post.comments.push(comment._id);
  await post.save();
  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Comment created", comment, post });
};

const editComment = async (req, res) => {
  const { id: commentId } = req.params;
  const { text } = req.body;
  if (!commentId) {
    throw new CustomError.BadRequestError("Comment id must be provided");
  }
  if (!text || text === "") {
    throw new CustomError.BadRequestError("text must be provided");
  }
  const comment = await Comment.findOne({
    _id: commentId,
    userId: req.user.userId,
  });
  if (!comment) {
    throw new CustomError.BadRequestError(
      `No comment with id: ${commentId} found in your comments`
    );
  }
  comment.text = text;
  await comment.save();
  res.status(StatusCodes.OK).json({ msg: "Comment Updated", comment });
};

const deleteComment = async (req, res) => {
  const { id: commentId } = req.params;
  if (!commentId) {
    throw new CustomError.BadRequestError("Comment id needs to be provided");
  }
  const comment = await Comment.findOne({
    _id: commentId,
    userId: req.user.userId,
  });
  if (!comment) {
    throw new CustomError.BadRequestError(
      `No comment with id: ${commentId} found in your comments`
    );
  }
  const post = await Post.findOne({ _id: comment.postId });
  post.comments = post.comments.filter((id) => id.toString() !== commentId);

  await comment.deleteOne();
  await post.save();
  res.status(StatusCodes.OK).json({ msg: "Comment Deleted" });
};

const getCommentsFromPost = async (req, res) => {
  const { id: postId } = req.params;
  if (!postId) {
    throw new CustomError.BadRequestError("Post id needs to be provided");
  }
  const post = await Post.findOne({ _id: postId }).populate({
    path: "comments",
    populate: {
      path: "userId",
      select: "username",
    },
  });
  if (!post) {
    throw new CustomError.NotFoundError(`No post found with id: ${postId}`);
  }
  res.status(StatusCodes.OK).json({ comments: post.comments });
};

module.exports = {
  createComment,
  editComment,
  deleteComment,

  getCommentsFromPost,
};
