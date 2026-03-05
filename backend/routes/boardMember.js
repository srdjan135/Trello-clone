const express = require("express");
const router = express.Router();

const checkAuth = require("../middlewares/check-auth");
const {
  getBoardMembers,
  deleteBoardMember,
} = require("../controllers/boardMember");

router.get("/boardMembers/:boardId", checkAuth, getBoardMembers);
router.delete("/boardMembers/:boardId/:memberId", checkAuth, deleteBoardMember);

module.exports = router;
