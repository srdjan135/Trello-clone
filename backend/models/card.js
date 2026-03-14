const mongoose = require("mongoose");

const cardSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Column",
      required: true,
    },
    order: { type: Number, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Card", cardSchema);
