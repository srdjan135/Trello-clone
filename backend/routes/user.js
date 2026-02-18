const express = require("express");
const checkAuth = require("../middlewares/check-auth");
const { getUser, manageUser, searchUsers } = require("../controllers/user");

const router = express.Router();

router.get("/user", checkAuth, getUser);
router.put("/user/:userId", checkAuth, manageUser);
router.get("/users/search", checkAuth, searchUsers);

module.exports = router;
