const express = require("express");
const router = express.Router();

const checkAuth = require("../middlewares/check-auth");
const { getBoards, postBoard } = require("../controllers/board");

router.get("/:workspaceId/boards", checkAuth, getBoards);
router.post("/:workspaceId/boards", checkAuth, postBoard);

module.exports = router;
