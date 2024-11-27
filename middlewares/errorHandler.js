const CustomApiError = require("../errors/custom-error");
const { StatusCodes } = require("http-status-codes");

const errorHandler = (err, req, res, next) => {
  if (err instanceof CustomApiError) {
    res.status(err.statusCode).json({ msg: err.message });
  }
  if (err.code === 11000) {
    const duplicate = Object.keys(err.keyValue);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: `Specified ${duplicate[0]} already exists` });
  }
  if ((err.name = "CastError")) {
    return res.send("cast");
  }
  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ msg: "Something Went Wrong" });
};

module.exports = errorHandler;
