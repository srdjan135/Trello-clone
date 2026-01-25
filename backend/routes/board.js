const express = require("express");
const router = express.Router();

const checkAuth = require("../middlewares/check-auth");
const { postBoard } = require("../controllers/board");

router.post("/boards", checkAuth, postBoard);

module.exports = router;
