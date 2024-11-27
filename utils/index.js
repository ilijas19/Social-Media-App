const { verifyToken, attachCookiesToResponse } = require("./jwt");
const createTokenUser = require("./createTokenUser");
const sendVerificationEmail = require("./sendVerificationEmail");
const sendPasswordResetEmail = require("./sendPasswordResetEmail");

module.exports = {
  verifyToken,
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
