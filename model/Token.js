const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema(
  {
    refreshToken: {
      type: String,
      required: [true, "Please provide refresh token"],
    },
    ip: {
      type: String,
      required: [true, "Please provide ip"],
    },
    userAgent: {
      type: String,
      required: [true, "Please provide user agent"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Token", TokenSchema);
