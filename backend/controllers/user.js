const User = require("../models/user");
const Workspace = require("../models/workspace");

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
  const q = req.query.q;
  const currentUserId = req.userData.userId;
  const workspaceId = req.query.workspaceId;

  if (!q) {
    return res.status(200).json({ users: [] });
  }

  const workspace = await Workspace.findById(workspaceId).select("members");

  const users = await User.find({
    _id: {
      $ne: currentUserId,
      $nin: workspace.members,
    },
    username: { $regex: q, $options: "i" },
  }).select("_id username");

  res.status(200).json({ users });
};
