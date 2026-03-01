const Notification = require("../models/notification");
const User = require("../models/user");
const BoardMember = require("../models/boardMember");
const Board = require("../models/board");
const Workspace = require("../models/workspace");
const WorkspaceMember = require("../models/workspaceMember");

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.userData.userId;

    const notifications = await Notification.find({ recipient: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ notifications });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications!" });
  }
};

exports.declineInvite = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const userId = req.userData.userId;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await Notification.findByIdAndDelete(notificationId);

    await User.findByIdAndUpdate(userId, {
      $pull: { notifications: notificationId },
    });

    res.status(200).json({});
  } catch (err) {
    res.status(500).json({ message: "Failed to decline invite" });
  }
};

exports.acceptInvite = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const userId = req.userData.userId;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const { type, data } = notification;

    if (type === "WORKSPACE_INVITE") {
      await Workspace.findByIdAndUpdate(data.workspaceId, {
        $addToSet: { members: userId },
      });

      await WorkspaceMember.create({
        workspace: data.workspaceId,
        user: userId,
      });
    }

    if (type === "BOARD_INVITE") {
      await Board.findByIdAndUpdate(data.boardId, {
        $addToSet: { members: userId },
      });

      await BoardMember.create({
        board: data.boardId,
        user: userId,
      });
    }

    await Notification.findByIdAndDelete(notificationId);

    await User.findByIdAndUpdate(userId, {
      $pull: { notifications: notificationId },
    });

    res.status(200).json({});
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Failed to accept invite" });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userData.userId;

    await Notification.findByIdAndDelete(notificationId);
    await User.findByIdAndUpdate(userId, {
      $pull: { notification: notificationId },
    });

    res.status(200).json({});
  } catch (err) {
    res.status(500).json({ message: "Failed to delete notification!" });
  }
};

exports.readNotifications = async (req, res) => {
  try {
    const userId = req.userData.userId;

    await Notification.updateMany(
      {
        recipient: userId,
        read: false,
      },
      {
        $set: { read: true },
      },
    );

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notifications" });
  }
};
