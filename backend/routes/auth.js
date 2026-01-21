const express = require("express");
const multer = require("multer");
const { signUp } = require("../controllers/auth");
const { signIn } = require("../controllers/auth");
const {
  signupValidator,
  signinValidator,
} = require("../validators/auth.validators");

const validate = require("../middlewares/validate");

const router = express.Router();

router.post("/signup", multer().none(), signupValidator, validate, signUp);
router.post("/signin", multer().none(), signinValidator, validate, signIn);

module.exports = router;
