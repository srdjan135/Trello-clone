const Board = require("../models/board");
const Workspace = require("../models/workspace");

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
