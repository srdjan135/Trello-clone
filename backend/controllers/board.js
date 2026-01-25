const Board = require("../models/board");
const Workspace = require("../models/workspace");

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

exports.postBoard = async (req, res) => {
  const { title, background, workspaceId } = req.body;
  const userId = req.userData.userId;

  try {
    const board = await Board.create({
      title,
      background,
      members: [userId],
      workspace: workspaceId,
    });

    await Workspace.findByIdAndUpdate(workspaceId, {
      $push: { boards: board._id },
    });

    res.status(201).json({ board });
  } catch (err) {
    res.status(500).json({ message: "Failed to create board!" });
  }
};
