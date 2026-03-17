const express = require("express");
const checkAuth = require("../middlewares/check-auth");
const {
  getUser,
  manageUser,
  searchUsers,
  contactSupport,
  deleteAccount,
} = require("../controllers/user");

const router = express.Router();

router.get("/user", checkAuth, getUser);
router.put("/user/:userId", checkAuth, manageUser);
router.get("/users/search", checkAuth, searchUsers);
router.post("/contact-support", checkAuth, contactSupport);
router.delete("/users/user/delete", checkAuth, deleteAccount);

module.exports = router;
