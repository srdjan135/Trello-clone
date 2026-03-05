const Board = require("../models/board");
const Workspace = require("../models/workspace");
const WorkspaceMember = require("../models/workspaceMember");
const Notification = require("../models/notification");
const User = require("../models/user");
const BoardMember = require("../models/boardMember");

exports.getBoards = async (req, res) => {
  const workspaceId = req.params.workspaceId;

  try {
    const boards = await Board.find({ workspace: workspaceId });

    if (!boards) {
      return res.status(404).json({ message: "Boards not found" });
    }

    res.status(200).json({ boards });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch boards!" });
  }
};

exports.getBoard = async (req, res) => {
  const { boardId } = req.params;
  const userId = req.userData.userId;

  try {
    const board = await Board.findById(boardId).populate("workspace").lean();

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (board.visibility === "public") {
      return res.status(200).json({ board });
    }

    if (board.visibility === "private") {
      const isBoardMember = board.members.some(
        (m) => m.toString() === userId.toString(),
      );

      if (!isBoardMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      return res.status(200).json({ board });
    }

    if (board.visibility === "workspace") {
      const workspace = await Workspace.findById(board.workspace._id);

      const isWorkspaceMember = workspace.members.some(
        (m) => m.toString() === userId.toString(),
      );

      if (!isWorkspaceMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      return res.status(200).json({ board });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch board!" });
  }
};

exports.postBoard = async (req, res) => {
  const { title, background, workspaceId } = req.body;
  const userId = req.userData.userId;

  try {
    const board = await Board.create({
      title,
      background,
      members: [userId],
      workspace: workspaceId,
      visibility: "private",
    });

    await Workspace.findByIdAndUpdate(workspaceId, {
      $push: { boards: board._id },
    });

    await BoardMember.create({
      board: board._id,
      user: userId,
      role: "admin",
    });

    res.status(201).json({ board });
  } catch (err) {
    res.status(500).json({ message: "Failed to create board!" });
  }
};

exports.searchBoards = async (req, res) => {
  const query = String(req.query.q || "");

  try {
    const boards = await Board.find({
      visibility: "public",
      title: { $regex: query, $options: "i" },
    })
      .populate("workspace")
      .lean();

    return res.status(200).json({ boards });
  } catch (err) {
    res.status(500).json({ message: "Failed to search boards!" });
  }
};

exports.updateBoard = async (req, res) => {
  const { boardId } = req.params;
  const updates = req.body;

  const allowedFields = [
    "title",
    "background",
    "members",
    "workspace",
    "description",
    "visibility",
  ];

  const filteredUpdates = {};

  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  }

  try {
    const board = await Board.findByIdAndUpdate(
      boardId,
      { $set: filteredUpdates },
      { new: true },
    ).populate("workspace");

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (board.visibility === "workspace") {
      const workspaceMembers = await WorkspaceMember.find({
        workspace: board.workspace._id,
      });

      const workspace = await Workspace.findById(board.workspace._id);

      const workspaceMemberIds = workspace.members.map((id) => id.toString());

      const boardMemberIds = board.members.map((id) => id.toString());

      const membersToAdd = workspaceMemberIds.filter(
        (id) => !boardMemberIds.includes(id),
      );

      await Board.findByIdAndUpdate(boardId, {
        $addToSet: {
          members: { $each: membersToAdd },
        },
      });

      for (const workspaceMember of workspaceMembers) {
        const existingBoardMember = await BoardMember.findOne({
          board: boardId,
          user: workspaceMember.user,
        });

        if (!existingBoardMember) {
          await BoardMember.create({
            board: boardId,
            user: workspaceMember.user,
            role: "member",
            addedViaWorkspace: true,
          });
        }
      }
    }

    if (board.visibility === "private") {
      const workspaceAddedMembers = await BoardMember.find({
        board: boardId,
        addedViaWorkspace: true,
      }).select("user");

      const userIdsToRemove = workspaceAddedMembers.map((m) =>
        m.user.toString(),
      );

      await Board.findByIdAndUpdate(boardId, {
        $pull: {
          members: { $in: userIdsToRemove },
        },
      });

      await BoardMember.deleteMany({
        board: boardId,
        addedViaWorkspace: true,
      });
    }

    const boardMembers = await BoardMember.find({
      board: boardId,
    }).populate("user");

    res.status(200).json({ board, boardMembers });
  } catch (err) {
    res.status(500).json({ message: "Failed to update board!" });
  }
};

exports.inviteBoardMembers = async (req, res) => {
  const { allAddedMembers } = req.body;
  const { boardId } = req.params;
  const inviterId = req.userData.userId;

  const userIds = Object.keys(allAddedMembers.users);

  try {
    for (const userId of userIds) {
      const isMemberAlready = await Board.exists({
        _id: boardId,
        members: userId,
      });

      if (!isMemberAlready) {
        const sender = await User.findById(inviterId);
        const board = await Board.findById(boardId);

        const notification = await Notification.create({
          sender: sender,
          recipient: userId,
          type: "BOARD_INVITE",
          message: `${sender.username} invited you to ${board.title} board.`,
          data: {
            boardId,
            workspaceId: board.workspace.toString(),
            invitedBy: inviterId,
          },
        });

        const user = await User.findByIdAndUpdate(userId, {
          $push: { notifications: notification._id },
        });
      }
    }
    res.status(200).json({ message: "Invites sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to invite members!" });
  }
};
