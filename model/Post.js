const mongoose = require("mongoose");
const Comment = require("./Comment");

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

PostSchema.methods.calculateLikes = function () {
  this.numberOfLikes = this.likes.length;
};

PostSchema.pre("save", function () {
  if (this.isModified("likes")) {
    this.calculateLikes();
  }
});

PostSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await Comment.deleteMany({ postId: this._id });
  }
);

PostSchema.pre("deleteMany", { query: true }, async function () {
  const filter = this.getFilter(); // Get the filter for the posts being deleted
  const Post = mongoose.model("Post"); // Dynamically load the Post model here
  const postIds = await Post.find(filter).distinct("_id");

  // Delete comments for the posts being deleted
  await Comment.deleteMany({
    postId: { $in: postIds },
  });
});

module.exports = mongoose.model("Post", PostSchema);
