const User = require("../model/User");
const Post = require("../model/Post");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;

const { checkFile } = require("../utils");

const changeProfilePrivacy = async (req, res) => {
  const { privacy } = req.body;
  console.log(privacy === "public");
  if (!privacy) {
    throw new CustomError.BadRequestError("Privacy value needs to be provided");
  }
  if (privacy !== "public" && privacy !== "private") {
    throw new CustomError.BadRequestError("Invalid privacy value");
  }
  const user = await User.findOne({ _id: req.user.userId });
  if (user.privacy === privacy) {
    throw new CustomError.BadRequestError(`Your profile is already ${privacy}`);
  }
  user.privacy = privacy;
  await user.save();
  res
    .status(StatusCodes.OK)
    .json({ msg: `Profile privacy switched to: ${privacy}` });
};

const getOwnProfile = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).select(
    "-password -verificationToken -passwordResetToken -__v -savedPosts -chats"
  );
  res.status(StatusCodes.OK).json({ user });
};

const getUserProfile = async (req, res) => {
  const { name: username } = req.params;
  if (!username) {
    throw new CustomError.BadRequestError("Username Must be provided");
  }
  const user = await User.findOne({ username }).select(
    "username profilePicture followers following posts bio numFollowing numFollowers privacy followRequests"
  );
  if (!user) {
    throw new CustomError.NotFoundError(`No user with ${username} username`);
  }
  if (user.privacy === "private") {
    if (!user.followers.includes(req.user.userId)) {
      const requested = user.followRequests.includes(req.user.userId);
      const privateUser = {
        username: user.username,
        profilePicture: user.profilePicture,
        followers: user.followers,
        following: user.following,
        bio: user.bio,
        numFollowing: user.numFollowing,
        numFollowers: user.numFollowers,
        privacy: user.privacy,
        posts: "Private",
        requested,
      };
      return res.status(StatusCodes.OK).json({ user: privateUser });
    }
  }
  const currentUserFollowing = user.followers.includes(req.user.userId);
  const userWithFollowingData = { ...user.toJSON(), currentUserFollowing };

  res.status(StatusCodes.OK).json({ user: userWithFollowingData });
};

const getUserProfilePosts = async (req, res) => {
  const { name: username } = req.params;
  const { page = 1 } = req.query;
  if (!username) {
    throw new CustomError.BadRequestError("Username Must be provided");
  }
  const limit = 10;
  const skip = (page - 1) * limit;

  const user = await User.findOne({ username });

  if (!user) {
    throw new CustomError.NotFoundError(`No user with ${username} username`);
  }
  if (user.privacy === "private") {
    if (!user.followers.includes(req.user.userId)) {
      const postsWithUserData = "Private";
      return res.status(StatusCodes.OK).json({ postsWithUserData });
    }
  }
  const posts = await Post.find({ publisherId: user._id })
    .populate({
      path: "publisherId",
      select: "profilePicture",
    })
    .skip(skip)
    .limit(limit);

  const postsWithUserData = posts.map((post) => {
    const isLiked = post.likes.includes(user._id);
    const isSaved = user.savedPosts.includes(post._id);
    return { ...post.toJSON(), isLiked, isSaved };
  });

  res
    .status(StatusCodes.OK)
    .json({ nbHits: postsWithUserData.length, page, postsWithUserData });
};

const deleteProfile = async (req, res) => {
  const { password } = req.body;
  if (!password) {
    throw new CustomError.BadRequestError("Password Must Be Provided");
  }
  const user = await User.findOne({ _id: req.user.userId });

  if (!user) throw new CustomError.NotFoundError("User not found");

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.BadRequestError("Wrong Password");
  }
  //todo delete associated posts & posts comments too
  await user.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "profile deleted" });
};

const updateProfilePicture = async (req, res) => {
  const file = req.files.image;
  const check = checkFile(file);
  if (!check) {
    await fs.unlink(file.tempFilePath);
    throw new CustomError.BadRequestError("File not supported or exceedes 2mb");
  }
  const { secure_url } = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "social-media-app",
  });
  await fs.unlink(file.tempFilePath);
  const user = await User.findOne({ _id: req.user.userId });
  user.profilePicture = secure_url;
  await user.save();
  res
    .status(StatusCodes.OK)
    .json({ msg: "Profile picture updated", pf: user.profilePicture });
};

const updateBio = async (req, res) => {
  const { bio } = req.body;
  if (!bio) {
    throw new CustomError.BadRequestError("Bio must be provided");
  }
  const user = await User.findOne({ _id: req.user.userId });
  user.bio = bio;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Bio updated", user });
};

module.exports = {
  changeProfilePrivacy,
  getOwnProfile,
  getUserProfile,
  getUserProfilePosts,
  deleteProfile,
  updateProfilePicture,
  updateBio,
};
