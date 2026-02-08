const Workspace = require("../models/workspace");
const User = require("../models/user");
const Notification = require("../models/notification");

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

exports.getWorkspaceMembers = async (req, res) => {
  const { workspaceId } = req.params;

  try {
    const workspace = await Workspace.findById(workspaceId).populate("members");

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found!" });
    }

    res.status(200).json({ members: workspace.members });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch members!" });
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
          message: `${sender.username} vas je pozvao u ${workspace.name} workspace`,
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

exports.declineInviteToWorkspace = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const userId = req.userData.userId;

    await Notification.findByIdAndDelete(notificationId);
    await User.findByIdAndUpdate(userId, {
      $pull: {
        notifications: notificationId,
      },
    });
    res.status(200).json({});
  } catch (err) {
    res.status(500).json({ message: "Failed to invite members" });
  }
};

exports.acceptInviteToWorkspace = async (req, res) => {
  try {
    const { memberId, workspaceId, notificationId } = req.body;
    const userId = req.userData.userId;

    await Workspace.findByIdAndUpdate(workspaceId, {
      $addToSet: { members: memberId },
    });

    await Notification.findByIdAndDelete(notificationId);
    await User.findByIdAndUpdate(userId, {
      $pull: {
        notifications: notificationId,
      },
    });

    res.status(200).json({});
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

    res.status(201).json({
      workspace,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create workspace!" });
  }
};
