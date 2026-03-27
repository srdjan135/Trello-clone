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
    isComplete: { type: Boolean },
    description: { type: String },
    labels: [
      {
        name: String,
        color: String,
      },
    ],
    startDate: { type: Date },
    dueDate: { type: Date },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "BoardMember" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Card", cardSchema);
