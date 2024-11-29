const User = require("../model/User");
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
    "username profilePicture followers following posts bio numFollowing numFollowers privacy "
  );
  if (!user) {
    throw new CustomError.NotFoundError(`No user with ${username} username`);
  }
  if (user.privacy === "private") {
    if (!user.followers.includes(req.user.userId)) {
      throw new CustomError.UnauthorizedError("Follow User to see his profile");
    }
  }
  res.status(StatusCodes.OK).json({ user });
};

const deleteProfile = async (req, res) => {
  const { password } = req.body;
  if (!password) {
    throw new CustomError.BadRequestError("Password Must Be Provided");
  }
  const user = await User.findOne({ _id: req.user.userId });
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.BadRequestError("Wrong Password");
  }
  //todo delete associated posts & posts comments too
  await user.deleteOne({});
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
  deleteProfile,
  updateProfilePicture,
  updateBio,
};
