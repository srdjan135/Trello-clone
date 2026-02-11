const mongoose = require("mongoose");

const inviteTokenSchema = mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

module.exports = mongoose.model("InviteToken", inviteTokenSchema);
