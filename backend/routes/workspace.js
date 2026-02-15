const express = require("express");
const checkAuth = require("../middlewares/check-auth");
const { requireAdmin } = require("../middlewares/requireAdmin");
const {
  getWorkspaces,
  inviteWorkspaceMembers,
  declineInviteToWorkspace,
  acceptInviteToWorkspace,
  postWorkspace,
  updateWorkspace,
  deleteWorkspace,
} = require("../controllers/workspace");

const router = express.Router();

router.get("/workspaces", checkAuth, getWorkspaces);
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
router.post(
  "/workspace/:workspaceId/decline",
  checkAuth,
  declineInviteToWorkspace,
);
router.post(
  "/workspace/:workspaceId/accept",
  checkAuth,
  acceptInviteToWorkspace,
);

module.exports = router;
