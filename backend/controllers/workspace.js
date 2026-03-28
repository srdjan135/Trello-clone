const Workspace = require("../models/workspace");
const User = require("../models/user");
const Notification = require("../models/notification");
const WorkspaceMember = require("../models/workspaceMember");
const Board = require("../models/board");
const Column = require("../models/column");
const Card = require("../models/card");
const BoardMember = require("../models/boardMember");
const Comment = require("../models/comment");

exports.getWorkspaces = async (req, res) => {
  const userId = req.userData.userId;

  try {
    const workspaces = await Workspace.find({ members: userId });

    if (!workspaces) {
      return res.status(404).json({ message: "Workspaces not found" });
    }

    res.status(200).json({ workspaces });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch workspaces!" });
  }
};

exports.getPopulateWorkspaces = async (req, res) => {
  const userId = req.userData.userId;

  try {
    const workspaces = await Workspace.find({ members: userId }).populate(
      "boards",
    );

    if (!workspaces) {
      return res.status(404).json({ message: "Workspaces not found" });
    }

    res.status(200).json({ workspaces });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch workspaces!" });
  }
};

exports.inviteWorkspaceMembers = async (req, res) => {
  try {
    const { allAddedMembers, workspaceId } = req.body;
    const inviterId = req.userData.userId;

    const userIds = Object.keys(allAddedMembers.users);

    for (const userId of userIds) {
      const isMember = await Workspace.exists({
        _id: workspaceId,
        members: userId,
      });

      if (!isMember) {
        const sender = await User.findById(inviterId);
        const workspace = await Workspace.findById(workspaceId);

        const notification = await Notification.create({
          sender: inviterId,
          recipient: userId,
          type: "WORKSPACE_INVITE",
          message: `${sender.username} invited you to ${workspace.name} workspace`,
          data: {
            workspaceId,
            invitedBy: inviterId,
          },
        });

        const user = await User.findByIdAndUpdate(userId, {
          $push: { notifications: notification._id },
        });
      }
    }
    res.status(200).json({ message: "Invites sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to invite members" });
  }
};

exports.postWorkspace = async (req, res) => {
  const userId = req.userData.userId;
  const { name, description } = req.body;

  try {
    const workspace = await Workspace.create({
      name,
      members: [userId],
      isPrivate: true,
      description,
    });

    await User.findByIdAndUpdate(userId, {
      $push: { workspaces: workspace._id },
    });

    await WorkspaceMember.create({
      workspace: workspace._id,
      user: userId,
      role: "admin",
    });

    res.status(201).json({
      workspace,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create workspace!" });
  }
};

exports.updateWorkspace = async (req, res) => {
  const { workspaceId } = req.params;
  const { name, description, isPrivate } = req.body;

  try {
    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        name,
        description,
        isPrivate,
      },
      { new: true },
    );

    if (!updatedWorkspace) {
      return res.status(404).json({ message: "Workspace not found!" });
    }

    res.status(200).json({ updatedWorkspace });
  } catch (err) {
    res.status(500).json({ message: "Failed to update workspace!" });
  }
};

exports.deleteWorkspace = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.userData.userId;

  try {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found!" });
    }

    const member = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: userId,
      role: "admin",
    });

    if (!member) {
      return res.status(403).json({ message: "Not authorized!" });
    }

    const boardIds = (
      await Board.find({
        workspace: workspaceId,
      }).select("_id")
    ).map((b) => b._id);

    const columnIds = (
      await Column.find({
        boardId: { $in: boardIds },
      }).select("_id")
    ).map((c) => c._id);

    const cardIds = (
      await Card.find({ columnId: { $in: columnIds } }).select("_id")
    ).map((c) => c._id);

    await Comment.deleteMany({ cardId: { $in: cardIds } });

    await Card.deleteMany({ columnId: { $in: columnIds } });

    await Column.deleteMany({ boardId: { $in: boardIds } });

    await BoardMember.deleteMany({ board: { $in: boardIds } });

    await Board.deleteMany({ _id: { $in: boardIds } });

    await WorkspaceMember.deleteMany({ workspace: workspaceId });

    await User.updateMany(
      { workspaces: workspaceId },
      { $pull: { workspaces: workspaceId } },
    );

    await Workspace.findByIdAndDelete(workspaceId);

    res.status(200).json({ message: "Workspace deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete workspace!" });
  }
};
