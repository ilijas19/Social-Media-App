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
  const users = await User.find(queryObject).select(
    "_id username profilePicture privacy"
  );
  res.status(StatusCodes.OK).json({ users });
};

const followUnfollowUser = async (req, res) => {
  const { username } = req.params;
  let msg;
  if (!username) {
    throw new CustomError.BadRequestError("Username must be provided");
  }
  if (username === req.user.username) {
    throw new CustomError.BadRequestError("Cant follow yourself");
  }

  const user = await User.findOne({ username });
  const currentUser = await User.findOne({ _id: req.user.userId });
  if (!user) {
    throw new CustomError.NotFoundError("No user with specified username");
  }

  //UNFOLLOW
  if (user.followers.includes(req.user.userId)) {
    user.followers = user.followers.filter(
      (follower) => follower.toString() !== req.user.userId
    );
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== user._id.toString()
    );
    msg = "User Unfollowed";
  } else {
    //FOLLOW REQUEST('Private profile')
    if (user.privacy === "private") {
      if (user.followRequests.includes(req.user.userId)) {
        msg = "Request Removed";
        user.followRequests = user.followRequests.filter(
          (id) => id.toString() !== req.user.userId
        );
      } else {
        user.followRequests.push(req.user.userId);
        msg = "Request Sent";
      }
      await user.save();
      return res.status(StatusCodes.OK).json({ msg });
    }
    //FOLLOW
    user.followers.push(req.user.userId);
    currentUser.following.push(user._id);
    msg = "User Followed";
  }
  await user.save();
  await currentUser.save();
  return res.status(StatusCodes.OK).json({ msg });
};

const getUserFollowers = async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new CustomError.BadRequestError("Username must be provided");
  }
  const user = await User.findOne({ username }).populate({
    path: "followers",
    select: "username _id profilePicture followRequests",
  });

  const currentUser = await User.findOne({ _id: req.user.userId });

  if (!user) {
    throw new CustomError.BadRequestError(`No user with username ${username}`);
  }

  if (user.privacy === "private" && user.username !== req.user.username) {
    const isFollower = user.followers.some(
      (id) => id._id.toString() === req.user.userId
    );
    if (!isFollower) {
      throw new CustomError.UnauthorizedError(
        "You are not following specified user"
      );
    }
  }

  const followersWithUserData = user.followers.map((follower) => {
    const requested = follower.followRequests.includes(currentUser._id);
    const following = currentUser.following.includes(follower._id);
    const me = follower.username === req.user.username;
    return { ...follower.toJSON(), following, me, requested };
  });
  return res.status(StatusCodes.OK).json({ followers: followersWithUserData });
};

const getUserFollowing = async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new CustomError.BadRequestError("Username must be provided");
  }

  const user = await User.findOne({ username }).populate({
    path: "following",
    select: "_id username profilePicture followRequests",
  });

  if (!user) {
    throw new CustomError.NotFoundError("No user with specified username");
  }

  if (user.privacy === "private" && user.username !== req.user.username) {
    if (!user.followers.includes(req.user.userId)) {
      throw new CustomError.UnauthorizedError(
        "You are not following specified user"
      );
    }
  }

  const currentUser = await User.findOne({ _id: req.user.userId });

  const followingWithUserData = user.following.map((user) => {
    const requested = user.followRequests.includes(currentUser._id);
    const following = currentUser.following.includes(user._id);
    const me = user.username === req.user.username;
    return { ...user.toJSON(), following, me, requested };
  });

  res.status(StatusCodes.OK).json({ following: followingWithUserData });
};

const getFollowRequests = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).populate({
    path: "followRequests",
    select: "username profilePicture _id",
  });
  res.status(StatusCodes.OK).json({ requests: user.followRequests });
};

const acceptFollowRequest = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    throw new CustomError.BadRequestError("Username Must Be Provided");
  }
  const user = await User.findOne({ username });
  if (!user) {
    throw new CustomError.NotFoundError("No user with specified username");
  }
  const currentUser = await User.findOne({ _id: req.user.userId });
  if (!currentUser.followRequests.includes(user._id)) {
    throw new CustomError.NotFoundError(
      "User with specified username is not in your requests"
    );
  }
  user.following.push(currentUser._id);
  currentUser.followers.push(user._id);
  currentUser.followRequests = currentUser.followRequests.filter(
    (id) => id.toString() !== user._id.toString()
  );
  await user.save();
  await currentUser.save();
  res
    .status(StatusCodes.OK)
    .json({ msg: "Request accepted", currentUser, user });
};

const declineFollowRequest = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    throw new CustomError.BadRequestError("username must be provided");
  }
  const user = await User.findOne({ username });
  if (!user) {
    throw new CustomError.NotFoundError(
      "User with specified username was not found"
    );
  }
  const currentUser = await User.findOne({ _id: req.user.userId });
  if (!currentUser.followRequests.includes(user._id)) {
    throw new CustomError.NotFoundError(
      "User with specified username is not in your requests"
    );
  }
  currentUser.followRequests = currentUser.followRequests.filter(
    (id) => id.toString() !== user._id.toString()
  );
  res.status(StatusCodes.OK).json({ msg: "Request declined" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  deleteUser,
  searchForUser,
  followUnfollowUser,
  getFollowRequests,
  getUserFollowers,
  getUserFollowing,
  acceptFollowRequest,
  declineFollowRequest,
};
