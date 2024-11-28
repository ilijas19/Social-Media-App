const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["status", "post"],
      required: true,
    },
    publisherId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    publisherUsername: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: function () {
        return this.type === "status";
      },
      maxlength: [500, "Text cannot exceed 500 characters"],
    },
    imgUrl: {
      type: String,
      required: function () {
        return this.type === "post";
      },
    },
    comments: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    numberOfLikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
