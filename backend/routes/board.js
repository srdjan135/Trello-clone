const express = require("express");
const router = express.Router();

const checkAuth = require("../middlewares/check-auth");
const {
  getBoards,
  getBoard,
  postBoard,
  searchBoards,
  updateBoardVisibility,
  updateBoardDescription,
  inviteBoardMembers,
} = require("../controllers/board");

router.get("/:workspaceId/boards", checkAuth, getBoards);
router.get("/boards/:boardId", checkAuth, getBoard);
router.post("/:workspaceId/boards", checkAuth, postBoard);
router.get("/boards/search", checkAuth, searchBoards);
router.put("/boards/:boardId/visibility", checkAuth, updateBoardVisibility);
router.put("/boards/:boardId/description", checkAuth, updateBoardDescription);
router.post("/boards/:boardId/invite", checkAuth, inviteBoardMembers);

module.exports = router;
