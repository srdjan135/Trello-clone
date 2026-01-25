const mongoose = require("mongoose");

const workspaceSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isPrivate: { type: Boolean, required: true, default: true },
    description: { type: String },
    boards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Board" }],
  },
  { timestamps: true, default: false },
);

module.exports = mongoose.model("Workspace", workspaceSchema);
