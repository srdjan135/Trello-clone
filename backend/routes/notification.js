const express = require("express");
const router = express.Router();

const {
  getNotifications,
  deleteNotification,
  readNotifications,
} = require("../controllers/notification");
const checkAuth = require("../middlewares/check-auth");

router.get("/notifications", checkAuth, getNotifications);
router.delete("/:notificationId", checkAuth, deleteNotification);
router.put("/:userId/notifications", checkAuth, readNotifications);

module.exports = router;
