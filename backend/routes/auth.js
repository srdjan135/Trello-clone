const express = require("express");
const multer = require("multer");
const { signUp } = require("../controllers/auth");
const { signIn } = require("../controllers/auth");

const router = express.Router();

router.post("/signup", multer().none(), signUp);
router.post("/signin", multer().none(), signIn);

module.exports = router;
