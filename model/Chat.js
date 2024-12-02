const mongoose = require("mongoose");
const Message = require("./Message");

const ChatSchema = new mongoose.Schema(
  {
    users: {
      type: [mongoose.Types.ObjectId],
      ref: "User",
      required: [true, "Users are required in a chat"],
      validate: {
        validator: function (arr) {
          return arr.length === 2;
        },
        message: "Chat must have exactly 2 users",
      },
    },
    messages: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

ChatSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await Message.deleteMany({ chatId: this._id });
  }
);

module.exports = mongoose.model("Chat", ChatSchema);
