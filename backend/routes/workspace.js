const express = require("express");
const checkAuth = require("../middlewares/check-auth");
const { getWorkspaces } = require("../controllers/workspace");

const router = express.Router();

router.get("/workspaces", checkAuth, getWorkspaces);

module.exports = router;
