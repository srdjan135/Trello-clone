const Workspace = require("../models/workspace");
const InviteToken = require("../models/inviteToken");
const WorkspaceMember = require("../models/workspaceMember");
const crypto = require("crypto");

exports.createInvite = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.userData.userId;

  await InviteToken.deleteMany({
    workspaceId,
    createdBy: userId,
  });

  const isMember = await WorkspaceMember.exists({
    workspace: workspaceId,
    user: userId,
  });

  if (!isMember) {
    return res.status(403).json({ message: "Not Allowed" });
  }

  const token = crypto.randomBytes(32).toString("hex");

  const invite = await InviteToken.create({
    token,
    workspaceId,
    createdBy: userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
  });

  res.json({
    inviteLink: `${process.env.FRONTEND_URL}/invite/${invite.token}`,
  });
};

exports.validateInvite = async (req, res) => {
  const { token } = req.params;

  const invite = await InviteToken.findOne({ token });

  if (!invite || invite.expiresAt < new Date()) {
    return res.status(400).json({ message: "Invalid invite" });
  }

  res.json({ workspaceId: invite.workspaceId });
};

exports.acceptInvite = async (req, res) => {
  const { token } = req.params;
  const currentUserId = req.userData.userId;

  const invite = await InviteToken.findOne({ token });

  if (!invite || invite.expiresAt < new Date()) {
    return res.status(400).json({ message: "Invalid invite" });
  }

  if (invite.createdBy.equals(currentUserId)) {
    return res.status(400).json({ message: "Cannot accept your own invite" });
  }

  const alreadyMember = await WorkspaceMember.exists({
    workspace: invite.workspaceId,
    user: currentUserId,
  });

  if (alreadyMember) {
    return res.status(400).json({ message: "Already member of workspace" });
  }

  await Workspace.findByIdAndUpdate(invite.workspaceId, {
    $addToSet: { members: currentUserId },
  });

  await WorkspaceMember.create({
    workspace: invite.workspaceId,
    user: currentUserId,
  });
  res.json({ message: "Joined workspace successfully" });
};
