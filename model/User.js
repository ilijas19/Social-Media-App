const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const Post = require("./Post");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide username"],
      maxLength: 20,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      validate: {
        validator: function (email) {
          return validator.isEmail(email);
        },
        message: "Not Valid Email",
      },
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      maxLength: 70,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    followers: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    followRequests: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    numFollowing: {
      type: Number,
      default: 0,
    },
    numFollowers: {
      type: Number,
      default: 0,
    },
    posts: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Post",
      },
    ],
    savedPosts: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Post",
      },
    ],
    chats: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Chat",
      },
    ],
    profilePicture: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "No additional bio",
      maxLength: 160,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "deactivated"],
      default: "active",
    },

    notifications: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Notification",
      },
    ],
    privacy: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    online: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: true, //switch to false
    },
    verificationToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
  },
  { timestamps: true }
);

UserSchema.methods.calculateNumbers = function () {
  this.numFollowers = this.followers.length;
  this.numFollowing = this.following.length;
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.pre("save", async function () {
  if (this.isModified("followers") || this.isModified("following")) {
    this.calculateNumbers();
  }

  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

UserSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await Post.deleteMany({ publisherId: this._id });
  }
);

module.exports = mongoose.model("User", UserSchema);
