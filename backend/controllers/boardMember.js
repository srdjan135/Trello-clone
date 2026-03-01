const BoardMember = require("../models/boardMember");

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
