const BoardMember = require("../models/boardMember");
const Board = require("../models/board");

exports.getBoardMembers = async (req, res) => {
  const { boardId } = req.params;

  try {
    const boardMembers = await BoardMember.find({ board: boardId }).populate(
      "user",
      "username email",
    );
    res.status(200).json({ boardMembers });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch board members!" });
  }
};

exports.deleteBoardMember = async (req, res) => {
  const { boardId, memberId } = req.params;

  try {
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const boardMember = await BoardMember.findById(memberId);
    if (!boardMember) {
      return res.status(404).json({ message: "Board member not found" });
    }

    await Board.findByIdAndUpdate(boardId, {
      $pull: { members: boardMember.user },
    });

    await BoardMember.findByIdAndDelete(memberId);

    res.status(200).json({ boardMember });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete board member!" });
  }
};
