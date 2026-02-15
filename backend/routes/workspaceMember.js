const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/check-auth");

const {
  getWorkspaceMembers,
  setWorkspaceMemberRole,
  removeWorkspaceMember,
  getMyRole,
} = require("../controllers/workspaceMember");

router.get("/workspaceMembers/:workspaceId", checkAuth, getWorkspaceMembers);
router.put("/workspaceMembers/:memberId", checkAuth, setWorkspaceMemberRole);
router.delete("/workspaceMembers/:memberId", checkAuth, removeWorkspaceMember);
router.get("/workspaces/:workspaceId/role", checkAuth, getMyRole);

module.exports = router;
