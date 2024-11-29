const User = require("../model/User");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");

//admin
const getAllUsers = async (req, res) => {
  const users = await User.find({}).select("_id username email role");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;
  if (!userId) {
    throw new CustomError.BadRequestError("User id needs to be provided");
  }
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${userId}`);
  }
  res.status(StatusCodes.OK).json({ user });
};

const deleteUser = async (req, res) => {
  const { id: userId } = req.params;
  if (!userId) {
    throw new CustomError.BadRequestError("User id needs to be provided");
  }
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${userId}`);
  }
  await user.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "User Deleted From DB" });
};

//public
const searchForUser = async (req, res) => {
  let queryObject = {};
  const { username } = req.query;
  if (username) {
    queryObject.username = { $regex: username, $options: "i" };
  }
  const users = await User.find(queryObject);
  res.status(StatusCodes.OK).json({ users });
};

const followUser = async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new CustomError.BadRequestError("Username must be provided");
  }
  const user = await User.findOne({ username }).select(
    "username following followers followRequests numFollowing numFollowers privacy"
  );
  if (!user) {
    throw new CustomError.NotFoundError("No user with specified username");
  }
  if (user._id.toString() === req.user.userId.toString()) {
    throw new CustomError.BadRequestError("Cant follow yourself");
  }
  if (user.followers.includes(req.user.userId)) {
    throw new CustomError.BadRequestError("You already follow this user");
  }
  //IF USER IS PRIVATE
  if (user.privacy === "private") {
    if (user.followRequests.includes(req.user.userId)) {
      throw new CustomError.BadRequestError("You already sent follow request");
    }
    user.followRequests.push(req.user.userId);
    await user.save();
    return res.status(StatusCodes.OK).json({ user });
  }
  //IF USER PRIVACY IS PUBLIC
  const currentUser = await User.findOne({ _id: req.user.userId }).select(
    "username following followers followRequests numFollowing numFollowers privacy"
  );
  currentUser.following.push(user._id);
  user.followers.push(req.user.userId);
  await currentUser.save();
  await user.save();
  res.status(StatusCodes.OK).json({ candidate: user, currentUser });
};

const unfollowUser = async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new CustomError.BadRequestError("Username must be providied");
  }
  const user = await User.findOne({ username }).select(
    "username following followers followRequests numFollowing numFollowers privacy"
  );

  if (!user) {
    throw new CustomError.NotFoundError("No user with specified username");
  }
  if (!user.followers.includes(req.user.userId)) {
    throw new CustomError.BadRequestError("You are not following this user");
  }
  const currentUser = await User.findOne({ _id: req.user.userId }).select(
    "username following followers followRequests numFollowing numFollowers privacy"
  );

  currentUser.following = user.following.filter(
    (id) => id.toString() !== user._id
  );

  user.followers = user.followers.filter(
    (id) => id.toString() !== req.user.userId.toString()
  );

  await currentUser.save();
  await user.save();
  res.status(StatusCodes.OK).json({ candidate: user, currentUser });
};

const getFollowers = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).populate({
    path: "followers",
    select: "username profilePicture",
  });
  res.status(StatusCodes.OK).json({ followers: user.followers });
};

const getFollowing = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).populate({
    path: "following",
    select: "username profilePicture",
  });
  res.status(StatusCodes.OK).json({ followingList: user.following });
};

const getFollowRequests = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).populate({
    path: "followRequests",
    select: "username profilePicture",
  });
  res.status(StatusCodes.OK).json({ requests: user.followRequests });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  deleteUser,
  followUser,
  unfollowUser,
  searchForUser,
  getFollowers,
  getFollowing,
  getFollowRequests,
};
