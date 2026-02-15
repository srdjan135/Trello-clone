const WorkspaceMember = require("../models/workspaceMember");

exports.requireAdmin = async (req, res, next) => {
  const { workspaceId } = req.params;
  const userId = req.userData.userId;

  try {
    const member = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: userId,
    });

    if (!member || member.role !== "admin") {
      return res.status(403).json({ message: "Access denied!" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Authorization failed!" });
  }
};
