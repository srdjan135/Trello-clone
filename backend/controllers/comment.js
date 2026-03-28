const Comment = require("../models/comment");
const Card = require("../models/card");

exports.getComments = async (req, res) => {
  const { cardId } = req.params;

  try {
    const comments = await Comment.find({ cardId }).populate("user");

    if (!comments) {
      res.status(404).json({ message: "Comments not found!" });
    }

    res.status(200).json({ comments });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch comments!" });
  }
};

exports.createComment = async (req, res) => {
  const { cardId } = req.params;
  const { userId } = req.userData;
  const { commentContent } = req.body;

  try {
    const comment = await Comment.create({
      user: userId,
      content: commentContent,
      cardId,
    });

    if (!comment) {
      res.status(404).json({ message: "Comment not found!" });
    }

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
    );

    await Card.findByIdAndUpdate(cardId, {
      $push: { comments: comment._id },
    });

    res.status(200).json({ comment: populatedComment });
  } catch (err) {
    res.status(500).json({ message: "Failed to create comment!" });
  }
};

exports.updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: { content: content },
      },
      { new: true },
    );

    if (!comment) {
      res.status(404).json({ message: "Comment not found!" });
    }

    res.status(200).json({ comment });
  } catch (err) {
    res.status(500).json({ message: "Failed to update comment!" });
  }
};

exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      res.status(404).json({ message: "Comment not found!" });
    }

    await Card.findByIdAndUpdate(comment.cardId, {
      $pull: { comments: comment._id },
    });

    await Comment.deleteOne({ _id: commentId });

    res.status(200).json({ message: "Comment deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete comment!" });
  }
};
