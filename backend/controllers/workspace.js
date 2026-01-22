const Workspace = require("../models/workspace");

exports.getWorkspaces = async (req, res) => {
  const userId = req.userData.userId;

  try {
    const workspaces = await Workspace.find({ members: userId });

    if (!workspaces) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ workspaces });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch workspaces!" });
  }
};
