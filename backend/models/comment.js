const mongoose = require("mongoose");
const { timestamp } = require("rxjs");

const commentSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Comment", commentSchema);
