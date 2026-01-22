const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Workspace = require("../models/workspace");

const TOKEN_EXPIRES_IN = 3600;

exports.signUp = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const emailExist = await User.exists({ email });

    if (emailExist) {
      return res.status(400).json({ message: "E-mail already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      workspaces: [],
    });

    const workspace = await Workspace.create({
      name: "Default",
      members: [user._id],
      isPrivate: true,
      description: "This is the default trello workspace!",
    });

    await User.findByIdAndUpdate(user._id, {
      $addToSet: { workspaces: workspace._id },
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
    res.status(500).json({ message: "Sign up filed!", err });
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        errors: [
          {
            field: "email",
            message: "User with this email does not exist",
          },
        ],
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        errors: [
          {
            field: "password",
            message: "Incorrect password",
          },
        ],
      });
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
