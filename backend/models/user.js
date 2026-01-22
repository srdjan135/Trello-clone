const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true, select: false },
    password: { type: String, required: true },
    workspaces: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
      },
    ],
  },
  { timestamps: true, default: false },
);

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
