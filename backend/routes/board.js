const express = require("express");
const router = express.Router();

const checkAuth = require("../middlewares/check-auth");
const { getBoards, postBoard, searchBoards } = require("../controllers/board");

router.get("/:workspaceId/boards", checkAuth, getBoards);
router.post("/:workspaceId/boards", checkAuth, postBoard);
router.get("/boards/search", checkAuth, searchBoards);

module.exports = router;
