const express = require("express");
const checkAuth = require("../middlewares/check-auth");
const {
  getWorkspaces,
  getWorkspaceMembers,
  inviteWorkspaceMembers,
  declineInviteToWorkspace,
  acceptInviteToWorkspace,
  postWorkspace,
} = require("../controllers/workspace");

const router = express.Router();

router.get("/workspaces", checkAuth, getWorkspaces);
router.get("/:workspaceId/members", checkAuth, getWorkspaceMembers);
router.post("/workspaces", checkAuth, postWorkspace);
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
