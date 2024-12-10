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

  const postsWithUserData = posts.map((post) => {
    const isSaved = user.savedPosts.includes(post._id);
    const isLiked = post.likes.includes(req.user.userId);
    return { ...post.toObject(), isSaved, isLiked };
  });

  res.status(StatusCodes.OK).json({ postsWithUserData });
};

//
const getExploreSectionPosts = async (req, res) => {
  const { page = 1 } = req.query;
  const user = await User.findOne({ _id: req.user.userId });

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

  const postsWithUserData = posts.map((post) => {
    const isSaved = user.savedPosts.includes(post._id);
    const isLiked = post.likes.includes(req.user.userId);
    return { ...post.toObject(), isSaved, isLiked };
  });

  res.status(StatusCodes.OK).json({ postsWithUserData });
};

const getOwnPosts = async (req, res) => {
  const { page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  const user = await User.findOne({ _id: req.user.userId });
  const posts = await Post.find({ publisherId: req.user.userId })
    .populate({
      path: "publisherId",
      select: "profilePicture",
    })
    .sort({ createdAt: -1 });

  const paginatedPosts = posts.slice(skip, limit + skip);

  const postsWithUserData = paginatedPosts.map((post) => {
    const isSaved = user.savedPosts.includes(post._id);
    const isLiked = post.likes.includes(user._id);
    return { ...post.toJSON(), isSaved, isLiked };
  });
  res
    .status(StatusCodes.OK)
    .json({ nbHits: postsWithUserData.length, page, postsWithUserData });
};

const getLikedPosts = async (req, res) => {
  const { page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  const user = await User.findOne({ _id: req.user.userId }).populate({
    path: "likedPosts",
    populate: {
      path: "publisherId",
      select: "profilePicture",
    },
  });
  const paginatedPosts = user.likedPosts
    .slice(skip, skip + limit)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const postsWithUserData = paginatedPosts.map((post) => {
    const isLiked = true;
    const isSaved = user.savedPosts.includes(post._id);
    return { ...post.toJSON(), isLiked, isSaved };
  });

  res
    .status(StatusCodes.OK)
    .json({ nbHits: paginatedPosts.length, page, postsWithUserData });
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
    user.savedPosts = user.savedPosts.filter(
      (post) => post._id.toString() !== postId.toString()
    );
    await user.save();
    return res.status(StatusCodes.OK).json({ msg: "post unsaved" });
  } else {
    user.savedPosts.push(postId);
    await user.save();
    return res.status(StatusCodes.OK).json({ msg: "post saved" });
  }
};

const getSavedPosts = async (req, res) => {
  const { page = 1 } = req.query;
  const limit = 10;
  const skip = (Number(page) - 1) * limit;

  const user = await User.findOne({ _id: req.user.userId }).populate({
    path: "savedPosts",
    // select: "publisherUsername imgUrl",
    populate: {
      path: "publisherId",
      select: "profilePicture",
    },
  });

  const paginatedPosts = user.savedPosts.slice(skip, skip + limit);

  const postsWithUserData = paginatedPosts.map((post) => {
    const isSaved = true;
    const isLiked = post.likes.includes(user._id);
    return { ...post.toJSON(), isSaved, isLiked };
  });

  res
    .status(StatusCodes.OK)
    .json({ nbHits: postsWithUserData.length, page, postsWithUserData });
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
  const user = await User.findOne({ _id: req.user.userId });

  if (post.likes.includes(req.user.userId)) {
    //Remove Like
    post.likes = post.likes.filter(
      (like) => like.toString() !== req.user.userId.toString()
    );
    user.likedPosts = user.likedPosts.filter(
      (postt) => postt._id.toString() !== postId.toString()
    );
    await post.save();
    await user.save();
    res.status(StatusCodes.OK).json({ msg: "like removed" });
  } else {
    //Like
    post.likes.push(req.user.userId);
    user.likedPosts.push(postId);
    await post.save();
    await user.save();
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
  getLikedPosts,
  getFollowingUsersPosts,
  getExploreSectionPosts,
  getSinglePost,
  getPostComments,
  getPostLikes,
  savePost,
  getSavedPosts,
  likeUnlikePost,
};
