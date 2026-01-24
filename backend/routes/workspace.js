const express = require("express");
const checkAuth = require("../middlewares/check-auth");
const { getWorkspaces, postWorkspace } = require("../controllers/workspace");

const router = express.Router();

router.get("/workspaces", checkAuth, getWorkspaces);
router.post("/workspaces", checkAuth, postWorkspace);

module.exports = router;
