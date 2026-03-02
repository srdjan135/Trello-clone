const mongoose = require("mongoose");

const boardSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    background: { type: String, required: true },
    members: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    visibility: {
      type: String,
      enum: ["private", "workspace", "public"],
      required: true,
      default: "private",
    },
    description: { type: String },
    addedViaWorkspace: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, default: false },
);

module.exports = mongoose.model("Board", boardSchema);
