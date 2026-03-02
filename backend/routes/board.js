const express = require("express");
const router = express.Router();

const checkAuth = require("../middlewares/check-auth");
const {
  getBoards,
  getBoard,
  postBoard,
  searchBoards,
  updateBoard,
  inviteBoardMembers,
} = require("../controllers/board");

router.get("/:workspaceId/boards", checkAuth, getBoards);
router.get("/boards/search", checkAuth, searchBoards);
router.get("/boards/:boardId", checkAuth, getBoard);
router.post("/:workspaceId/boards", checkAuth, postBoard);
router.patch("/boards/:boardId/update", checkAuth, updateBoard);
router.post("/boards/:boardId/invite", checkAuth, inviteBoardMembers);

module.exports = router;
