const express = require("express");
const router = express.Router();

const checkAuth = require("../middlewares/check-auth");
const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/comment");

router.get("/:cardId/comments", checkAuth, getComments);
router.post("/:cardId/comments", checkAuth, createComment);
router.patch("/comments/:commentId", checkAuth, updateComment);
router.delete("/comments/:commentId/delete", checkAuth, deleteComment);

module.exports = router;
