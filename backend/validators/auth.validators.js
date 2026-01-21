const { body } = require("express-validator");
const User = require("../models/user");

exports.signupValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required!")
    .isLength({ min: 3 })
    .withMessage("Username must contain 3 or more characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required!")
    .normalizeEmail()
    .isEmail()
    .withMessage("Please enter a valid email!")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("E-mail already exists");
      }
    }),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required!")
    .isLength({ min: 5 })
    .withMessage("Password must contain 5 or more characters"),
];

exports.signinValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required!")
    .normalizeEmail()
    .isEmail()
    .withMessage("Please enter a valid email!"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required!")
    .isLength({ min: 5 })
    .withMessage("Password must contain 5 or more characters"),
];
