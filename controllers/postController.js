const Post = require("../model/Post");
const User = require("../model/User");
const Comment = require("../model/Comment");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const cloudinary = require("cloudinary").v2;
const checkFile = require("../utils/checkFile");
const fs = require("fs").promises;

const createPost = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  const { type, text } = req.body;
  if (!type) throw new CustomError.BadRequestError("Type must be provided");

  if (type === "post") {
    if (!req.files) {
      throw new CustomError.BadRequestError("Image must be provided");
    }
    const file = req.files.image;
    const fileCheck = checkFile(file);

    if (!fileCheck) {
      await fs.unlink(file.tempFilePath);

      throw new CustomError.BadRequestError(
        "File not supported or excedes 2mb"
      );
    }

    const { secure_url } = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "social-media-app",
    });
    await fs.unlink(file.tempFilePath);
    const post = await Post.create({
      publisherId: user._id,
      publisherUsername: user.username,
      postPrivacy: user.privacy,
      text,
      type,
      imgUrl: secure_url,
    });
    user.posts.push(post._id);
    await user.save();
    return res.status(StatusCodes.CREATED).json({ post });
  }
  if (type === "status") {
    if (!text) {
      throw new CustomError.BadRequestError("Status text must be provided");
    }
    const post = await Post.create({
      publisherId: user._id,
      publisherUsername: user.username,
      text,
      type,
    });
    user.posts.push(post._id);
    await user.save();
    return res.status(StatusCodes.CREATED).json({ post });
  }
};

const getOwnPosts = async (req, res) => {
  const queryObject = { publisherId: req.user.userId };
  const { type } = req.query;
  if (type) {
    queryObject.type = type;
  }
  const posts = await Post.find(queryObject);
  res.status(StatusCodes.OK).json({ posts });
};

const getSinglePost = async (req, res) => {
  const { id: postId } = req.params;
  if (!postId) {
    throw new CustomError.BadRequestError("Post id needs to be provided");
  }
  const post = await Post.findOne({ _id: postId });
  if (!post) {
    throw new CustomError.NotFoundError(`No post with id: ${postId}`);
  }
  res.status(StatusCodes.OK).json({ post });
};

const editPost = async (req, res) => {
  const { id: postId } = req.params;
  const { text } = req.body;
  if (!text) {
    throw new CustomError.BadRequestError("Text must be provided");
  }
  if (!postId) {
    throw new CustomError.BadRequestError("Post id");
  }
  const post = await Post.findOne({ _id: postId });
  if (!post) {
    throw new CustomError.NotFoundError(`No post with id: ${postId}`);
  }
  post.text = text;
  await post.save();

  res.status(StatusCodes.OK).json({ msg: "Post updated", post });
};

const deletePost = async (req, res) => {
  const { id: postId } = req.params;
  if (!postId) {
    throw new CustomError.BadRequestError("Post id needs to be provided");
  }
  const post = await Post.findOne({
    _id: postId,
    publisherId: req.user.userId,
  });
  if (!post) {
    throw new CustomError.NotFoundError(
      `No post with id ${postId} found in your posts`
    );
  }

  await post.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "Post deleted" });
};

//
const getFollowingUsersPosts = async (req, res) => {
  const { page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  const user = await User.findOne({ _id: req.user.userId });

  // Fetch posts for all followed users in a single query
  const posts = await Post.find({
    publisherId: { $in: user.following },
  })
    .populate({
      path: "publisherId",
      select: "profilePicture",
    })
    .limit(limit)
    .skip(skip);

  res.status(StatusCodes.OK).json({ posts });
};

//
const getExploreSectionPosts = async (req, res) => {
  const { page = 1 } = req.query;

  const limit = 10;
  const skip = (Number(page) - 1) * limit;

  const posts = await Post.find({ postPrivacy: "public" })
    .populate({
      path: "publisherId",
      select: "profilePicture",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(StatusCodes.OK).json({ posts });
};
//
const getPostComments = async (req, res) => {
  res.send("getPostComments");
};

const savePost = async (req, res) => {
  const { id: postId } = req.params;
  if (!postId) {
    throw new CustomError.BadRequestError("Post id needs to be provided");
  }
  const post = await Post.findOne({ _id: postId });
  if (!post) {
    throw new CustomError.NotFoundError(`No post with id ${postId}`);
  }
  const user = await User.findOne({ _id: req.user.userId });
  if (user.savedPosts.includes(postId)) {
    user.savedPosts = user.savedPosts.filter((post) => post === postId);
    await user.save();
    return res.status(StatusCodes.OK).json({ msg: "post unsaved" });
  } else {
    user.savedPosts.push(postId);
    await user.save();
    return res.status(StatusCodes.OK).json({ msg: "post saved" });
  }
};

const getSavedPosts = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).populate({
    path: "savedPosts",
    select: "publisherUsername imgUrl",
  });

  res.status(StatusCodes.OK).json({ saved: user.savedPosts });
};

const likeUnlikePost = async (req, res) => {
  const { id: postId } = req.params;
  if (!postId) {
    throw new CustomError.BadRequestError("Post id needs to be provided");
  }
  const post = await Post.findOne({ _id: postId });
  if (!post) {
    throw new CustomError.NotFoundError(`No post found with id: ${postId}`);
  }
  if (post.likes.includes(req.user.userId)) {
    post.likes = post.likes.filter((like) => like === req.user.userId);
    await post.save();
    res.status(StatusCodes.OK).json({ msg: "like removed" });
  } else {
    post.likes.push(req.user.userId);
    await post.save();
    res.status(StatusCodes.OK).json({ msg: "post liked" });
  }
};

//
const getPostLikes = async (req, res) => {
  const { id: postId } = req.params;
  if (!postId) {
    throw new CustomError.BadRequestError("Post id needs to be provided");
  }
  const post = await Post.findOne({ _id: postId }).populate({
    path: "likes",
    select: "username profilePicture",
  });

  if (!post) {
    throw new CustomError.NotFoundError(`No post with id: ${postId}`);
  }
  res.status(StatusCodes.OK).json({ likes: post.likes });
};

module.exports = {
  createPost,
  editPost,
  deletePost,
  getOwnPosts,
  getFollowingUsersPosts,
  getExploreSectionPosts,
  getSinglePost,
  getPostComments,
  getPostLikes,
  savePost,
  getSavedPosts,
  likeUnlikePost,
};
