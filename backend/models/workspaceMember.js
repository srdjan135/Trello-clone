const mongoose = require("mongoose");

const workspaceMemberSchema = mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
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

module.exports = mongoose.model("WorkspaceMember", workspaceMemberSchema);
