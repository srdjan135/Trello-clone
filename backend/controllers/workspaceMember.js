const WorkspaceMember = require("../models/workspaceMember");
const Workspace = require("../models/workspace");
const User = require("../models/user");

exports.getWorkspaceMembers = async (req, res) => {
  const { workspaceId } = req.params;

  try {
    const members = await WorkspaceMember.find({
      workspace: workspaceId,
    }).populate("user", "username email");

    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({ message: "Failed to load workspace members" });
  }
};

exports.setWorkspaceMemberRole = async (req, res) => {
  try {
    const { member, role } = req.body;

    await WorkspaceMember.findByIdAndUpdate(member._id, {
      $set: { role: role },
    });
    res
      .status(200)
      .json({ message: "Successfully setted workspace member role" });
  } catch (err) {
    res.status(500).json({ message: "Failed to set workspace member role" });
  }
};

exports.removeWorkspaceMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { workspaceId } = req.query;

    const member = await WorkspaceMember.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (member.role === "admin") {
      const adminsCount = await WorkspaceMember.countDocuments({
        workspace: workspaceId,
        role: "admin",
      });

      if (adminsCount === 1) {
        await Workspace.findByIdAndDelete(workspaceId);
        await WorkspaceMember.deleteMany({ workspace: workspaceId });
        await User.updateMany(
          { workspaces: workspaceId },
          { $pull: { workspaces: workspaceId } },
        );

        return res.status(200).json({
          message: "Last admin removed, workspace deleted",
          workspaceDeleted: true,
        });
      }
    }

    await WorkspaceMember.findByIdAndDelete(memberId);
    await Workspace.findByIdAndUpdate(workspaceId, {
      $pull: { members: member.user },
    });

    res.status(200).json({ message: "Member removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove workspace member" });
  }
};

exports.getMyRole = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.userData.userId;

  try {
    const member = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: userId,
    });

    if (!member) {
      return res.status(404).json({ message: "Not a member" });
    }

    res.status(200).json({ role: member.role });
  } catch (err) {
    res.status(500).json({ message: "Failed to get role" });
  }
};
