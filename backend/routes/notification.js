const express = require("express");
const router = express.Router();

const {
  getNotifications,
  declineInvite,
  acceptInvite,
  deleteNotification,
  readNotifications,
} = require("../controllers/notification");
const checkAuth = require("../middlewares/check-auth");

router.get("/notifications", checkAuth, getNotifications);
router.post("/notifications/decline", checkAuth, declineInvite);
router.post("/notifications/accept", checkAuth, acceptInvite);
router.delete("/notifications/:notificationId", checkAuth, deleteNotification);
router.put("/:userId/notifications", checkAuth, readNotifications);

module.exports = router;
