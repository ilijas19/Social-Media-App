const Token = require("../model/Token");
const CustomError = require("../errors");
const { verifyToken } = require("../utils");

const authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (req.user.role === "admin") return next();
    if (roles.includes(req.user.role)) return next();
    throw new CustomError.UnauthorizedError("Not Authorized To Use This Route");
  };
};

const authenticateUser = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;

  if (accessToken) {
    const decoded = verifyToken(accessToken);
    req.user = decoded.user;
    return next();
  }

  if (refreshToken) {
    const decoded = verifyToken(refreshToken);
    const token = await Token.findOne({ user: decoded.userId });
    if (token && token.isValid) {
      req.user = decoded;
      return next();
    } else {
      throw new CustomError.UnauthenticatedError("Authentication Failed");
    }
  }

  throw new CustomError.UnauthenticatedError("Authentication Failed");
};

module.exports = { authorizePermission, authenticateUser };
