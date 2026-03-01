const express = require("express");
const router = express.Router();

const checkAuth = require("../middlewares/check-auth");
const { getBoardMembers } = require("../controllers/boardMember");

router.get("/boardMembers/:boardId", checkAuth, getBoardMembers);

module.exports = router;
