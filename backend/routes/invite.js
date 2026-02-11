const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/check-auth");
const {
  createInvite,
  validateInvite,
  acceptInvite,
} = require("../controllers/invite");

router.post("/workspaces/:workspaceId/invite", checkAuth, createInvite);
router.get("/invite/:token", checkAuth, validateInvite);
router.post("/invite/:token/accept", checkAuth, acceptInvite);

module.exports = router;
