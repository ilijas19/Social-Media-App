const User = require("../model/User");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");

//admin
const getAllUsers = async (req, res) => {
  const users = await User.find({});
  res.status(StatusCodes.OK).json({ users });
};

module.exports = { getAllUsers };
