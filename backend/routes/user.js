const express = require("express");
const checkAuth = require("../middlewares/check-auth");
const { getUser, searchUsers } = require("../controllers/user");

const router = express.Router();

router.get("/user", checkAuth, getUser);
router.get("/users/search", checkAuth, searchUsers);

module.exports = router;
