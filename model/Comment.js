const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Types.ObjectId,
    ref: "Post",
    required: [true, "Please provide post id"],
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: [true, "Please provide userId"],
  },
  text: {
    type: String,
    required: [true, "Please provide comment text"],
    maxLength: 150,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Comment", CommentSchema);
