const Workspace = require("../models/workspace");
const User = require("../models/user");

exports.getWorkspaces = async (req, res) => {
  const userId = req.userData.userId;

  try {
    const workspaces = await Workspace.find({ members: userId });

    if (!workspaces) {
      return res.status(404).json({ message: "Workspaces not found" });
    }

    res.status(200).json({ workspaces });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch workspaces!" });
  }
};

exports.postWorkspace = async (req, res) => {
  const userId = req.userData.userId;
  const { name, description } = req.body;

  try {
    const workspace = await Workspace.create({
      name,
      members: [userId],
      isPrivate: true,
      description,
    });

    await User.findByIdAndUpdate(userId, {
      $push: { workspaces: workspace._id },
    });

    res.status(201).json({
      workspace,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create workspace!" });
  }
};
