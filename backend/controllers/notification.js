const Notification = require("../models/notification");
const User = require("../models/user");

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
