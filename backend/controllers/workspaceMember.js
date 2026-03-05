const WorkspaceMember = require("../models/workspaceMember");
const Workspace = require("../models/workspace");
const User = require("../models/user");
const Board = require("../models/board");
const BoardMember = require("../models/boardMember");

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

    let boards = [];

    await WorkspaceMember.findByIdAndUpdate(member._id, {
      $set: { role },
    });

    await BoardMember.updateOne(
      { user: member.user },
      {
        $set: { role },
      },
    );

    if (role === "admin") {
      boards = await Board.find({ workspace: member.workspace });

      const currentBoards = await BoardMember.find({ user: member.user });
      const boardIds = currentBoards.map((b) => b.board);

      await WorkspaceMember.findByIdAndUpdate(member._id, {
        $set: { role, previousBoards: boardIds },
      });

      for (const board of boards) {
        await Board.updateOne(
          { _id: board._id },
          {
            $addToSet: { members: member.user },
          },
        );

        await BoardMember.updateOne(
          { board: board._id, user: member.user },
          { $set: { role: "admin" } },
          { upsert: true },
        );
      }
    }

    if (role === "member") {
      const workspaceMember = await WorkspaceMember.findById(member._id);

      const previousBoards = workspaceMember.previousBoards || [];

      boards = await Board.find({ workspace: member.workspace });

      for (const board of boards) {
        if (
          !previousBoards.some((id) => id.toString() === board._id.toString())
        ) {
          await Board.updateOne(
            { _id: board._id },
            {
              $pull: { members: member.user._id },
            },
          );

          await BoardMember.deleteOne({
            board: board._id,
            user: member.user,
          });
        } else {
          await BoardMember.updateOne(
            { board: board._id, user: member.user },
            { $set: { role: "member" } },
            { upsert: true },
          );
        }
      }

      await WorkspaceMember.findByIdAndUpdate(member._id, {
        $set: { role: "member" },
        $unset: { previousBoards: "" },
      });
    }

    res.status(200).json({ boards });
  } catch (err) {
    res.status(500).json({
      message: "Failed to set workspace member role",
    });
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

        const boards = await Board.find({ workspace: workspaceId }).select(
          "_id",
        );

        const boardIds = boards.map((b) => b._id);

        await BoardMember.deleteMany({
          board: { $in: boardIds },
        });

        await Board.deleteMany({
          workspace: workspaceId,
        });

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

    await Board.updateMany(
      { workspace: workspaceId },
      { $pull: { members: member.user } },
    );

    await BoardMember.deleteMany({ user: member.user });

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
