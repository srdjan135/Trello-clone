const mongoose = require("mongoose");

const boardMemberSchema = mongoose.Schema(
  {
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      default: "member",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("BoardMember", boardMemberSchema);
