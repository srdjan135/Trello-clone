const User = require("../models/user");
const Workspace = require("../models/workspace");
const nodemailer = require("nodemailer");
const Board = require("../models/board");
const WorkspaceMember = require("../models/workspaceMember");
const BoardMember = require("../models/boardMember");
const Column = require("../models/column");
const Card = require("../models/card");
const Comment = require("../models/comment");

exports.getUser = async (req, res) => {
  const userId = req.userData.userId;

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found! " });
    }

    res.status(200).json({
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user!" });
  }
};

exports.manageUser = async (req, res) => {
  const { username, email } = req.body;
  const { userId } = req.params;

  try {
    const editedUser = await User.findByIdAndUpdate(userId, {
      username,
      email,
    });

    if (!editedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({ editedUser });
  } catch (err) {
    res.status(500).json({ message: "Failed to manage user!" });
  }
};

exports.searchUsers = async (req, res) => {
  const { q, workspaceId, type, boardId } = req.query;
  const currentUserId = req.userData.userId;

  if (!q) {
    return res.status(200).json({ users: [] });
  }

  let excludeIds = [currentUserId];

  if (type === "workspace") {
    const workspace = await Workspace.findById(workspaceId).select("members");
    if (workspace) {
      excludeIds.push(...workspace.members);
    }
  }

  if (type === "board") {
    const board = await Board.findById(boardId).select("members");
    if (board) {
      excludeIds.push(...board.members);
    }
  }

  const users = await User.find({
    _id: { $nin: excludeIds },
    username: { $regex: q, $options: "i" },
  }).select("_id username");

  res.status(200).json({ users });
};

exports.contactSupport = async (req, res) => {
  const { category, subject, message } = req.body;
  const { userId } = req.userData;

  try {
    if (!category || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required!",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Trello Clone Support" <${process.env.EMAIL_USER}>`,
      to: process.env.SUPPORT_EMAIL,
      subject: `[Support - ${category.toUpperCase()}] ${subject}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>User ID:</strong> ${userId}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(transporter);

    res.status(200).json({
      message: "Support request sent successfully!",
    });
  } catch (err) {
    console.error("Support email error:", err);
    res.status(500).json({
      message: "Failed to send report!",
    });
  }
};

exports.deleteAccount = async (req, res) => {
  const { userId } = req.userData;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const adminMemberships = await WorkspaceMember.find({
      user: userId,
      role: "admin",
    });

    const workspaceIds = adminMemberships.map((m) => m.workspace);

    const boardIds = (
      await Board.find({
        workspace: { $in: workspaceIds },
      }).select("_id")
    ).map((b) => b._id);

    const columnIds = (
      await Column.find({
        boardId: { $in: boardIds },
      }).select("_id")
    ).map((c) => c._id);

    await Card.deleteMany({ columnId: { $in: columnIds } });

    await Column.deleteMany({ boardId: { $in: boardIds } });

    await BoardMember.deleteMany({ board: { $in: boardIds } });

    await Board.deleteMany({ _id: { $in: boardIds } });

    await WorkspaceMember.deleteMany({ workspace: { $in: workspaceIds } });

    await Workspace.deleteMany({ _id: { $in: workspaceIds } });

    await WorkspaceMember.deleteMany({ user: userId });

    await BoardMember.deleteMany({ user: userId });

    await Comment.deleteMany({ user: userId });

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete account!" });
  }
};
