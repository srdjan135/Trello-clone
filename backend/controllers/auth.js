const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, Validator } = require("express-validator");
const User = require("../models/user");

const TOKEN_EXPIRES_IN = 3600;

exports.signUp = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const emailExist = await User.exist({ email });

    if (emailExist) {
      return res.status(400).json({ message: "E-mail already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email,
      hashedPassword,
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" },
    );

    res.status(201).json({
      token,
      expiresIn: TOKEN_EXPIRES_IN,
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Sign up filed!" });
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      token,
      expiresIn: TOKEN_EXPIRES_IN,
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Sign in filed!" });
  }
};
