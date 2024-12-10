const User = require("../model/User");
const Token = require("../model/Token");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils");
const crypto = require("crypto");

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new CustomError.BadRequestError("All credientials must be provided");
  }
  const verificationToken = crypto.randomBytes(40).toString("hex");

  const user = await User.create({
    username,
    email,
    password,
    verificationToken,
  });

  //send email
  // await sendVerificationEmail({
  //   verifyToken: verificationToken,
  //   origin: process.env.ORIGIN || `http://localhost:5000`,
  //   email: user.email,
  //   name: user.username,
  // });

  res
    .status(StatusCodes.CREATED)
    .json({ msg: "Check Your Email For Verification" });
};

const verifyUser = async (req, res) => {
  const { email, verificationToken } = req.body;
  if (!email || !verificationToken) {
    throw new CustomError.BadRequestError("All credientials must be provided");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.BadRequestError("No User With Specified Email Found");
  }
  const isTokenEqual = user.verificationToken === verificationToken;
  if (!isTokenEqual) {
    throw new CustomError.UnauthenticatedError("Verification Failed");
  }
  user.verificationToken = "";
  user.isVerified = true;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Account Verified !" });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError("All credientials must be provided");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.NotFoundError("No user with specified email");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.BadRequestError("Wrong Password");
  }
  const tokenUser = createTokenUser(user);
  //existing token
  const existingToken = await Token.findOne({ user: tokenUser.userId });
  if (existingToken) {
    attachCookiesToResponse({
      res,
      user: tokenUser,
      refreshToken: existingToken.refreshToken,
    });
    return res.status(StatusCodes.OK).json({ msg: `Login successful` });
  }
  //no token
  const refreshToken = crypto.randomBytes(40).toString("hex");
  const ip = req.ip;
  const userAgent = req.headers["user-agent"];
  await Token.create({
    user: tokenUser.userId,
    ip,
    refreshToken,
    userAgent,
  });
  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ tokenUser });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError("Email must be provided");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.NotFoundError("No User With Specified Email");
  }
  const verifyToken = crypto.randomBytes(40).toString("hex");
  user.passwordResetToken = verifyToken;

  // await sendPasswordResetEmail({
  //   verifyToken,
  //   origin: process.env.ORIGIN || "http://localhost:5000",
  //   email: user.email,
  //   name: user.username,
  // });

  await user.save();
  res
    .status(StatusCodes.OK)
    .json({ msg: "Check email for password reset link", user });
};

const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    throw new CustomError.BadRequestError("All credientials must be provided");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.BadRequestError("No user found with specified email");
  }
  const isTokenEqual = user.passwordResetToken === token;
  if (!isTokenEqual) {
    throw new CustomError.BadRequestError("Reset Failed");
  }
  user.password = newPassword;
  user.passwordResetToken = "";
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Password Updated" });
};

const logoutUser = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(StatusCodes.OK).json({ msg: "Logout" });
};

const getCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).select(
    "_id username email bio privacy numFollowers numFollowing profilePicture"
  );
  res.status(StatusCodes.OK).json({ currentUser: user });
};

module.exports = {
  registerUser,
  verifyUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser,
  getCurrentUser,
};
