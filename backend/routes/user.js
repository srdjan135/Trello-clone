const express = require("express");
const checkAuth = require("../middlewares/check-auth");
const { getUser } = require("../controllers/user");

const router = express.Router();

router.get("/user", checkAuth, getUser);

module.exports = router;
