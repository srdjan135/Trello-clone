const express = require("express");
const checkAuth = require("../middlewares/check-auth");
const { requireAdmin } = require("../middlewares/requireAdmin");
const {
  getWorkspaces,
  getPopulateWorkspaces,
  inviteWorkspaceMembers,
  postWorkspace,
  updateWorkspace,
  deleteWorkspace,
} = require("../controllers/workspace");

const router = express.Router();

router.get("/workspaces", checkAuth, getWorkspaces);
router.get("/workspaces/populate", checkAuth, getPopulateWorkspaces);
router.post("/workspaces", checkAuth, postWorkspace);
router.put(
  "/workspaces/:workspaceId",
  checkAuth,
  requireAdmin,
  updateWorkspace,
);
router.delete(
  "/workspaces/:workspaceId",
  checkAuth,
  requireAdmin,
  deleteWorkspace,
);
router.post(
  "/workspace/:workspaceId/invite",
  checkAuth,
  inviteWorkspaceMembers,
);

module.exports = router;
