const Board = require("../models/board");
const Workspace = require("../models/workspace");
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

  try {
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    res.status(200).json({ board });
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
      visibility: "workspace",
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
  const query = req.query.q;

  try {
    const boards = await Board.find({
      title: { $regex: query, $options: "i" },
      visibility: "public",
    }).populate("workspace");

    if (!boards) {
      return res.status(404).json({ message: "Boards not found" });
    }

    res.status(200).json({ boards });
  } catch (err) {
    res.status(500).json({ message: "Failed to search board!" });
  }
};

exports.updateBoardVisibility = async (req, res) => {
  const { value } = req.body;
  const { boardId } = req.params;

  try {
    const board = await Board.findByIdAndUpdate(
      boardId,
      {
        $set: { visibility: value },
      },
      { new: true },
    );

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    res.status(200).json({ board });
  } catch (err) {
    res.status(500).json({ message: "Failed to update board visibility!" });
  }
};

exports.updateBoardDescription = async (req, res) => {
  const { boardDesc } = req.body;
  const { boardId } = req.params;

  try {
    const board = await Board.findByIdAndUpdate(
      boardId,
      {
        $set: { description: boardDesc },
      },
      { new: true },
    );

    res.status(200).json({ board });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update board description!" });
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
