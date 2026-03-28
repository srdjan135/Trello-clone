const Board = require("../models/board");
const Column = require("../models/column");
const Card = require("../models/card");
const Comment = require("../models/comment");

exports.createColumn = async (req, res) => {
  const { columnTitle } = req.body;
  const { boardId } = req.params;

  try {
    const board = await Board.findById(boardId);

    if (!board) {
      res.status(404).json({ message: "Board not found!" });
    }

    const count = await Column.countDocuments({ boardId });

    const column = await Column.create({
      title: columnTitle,
      boardId,
      order: count,
    });

    if (!column) {
      res.status(404).json({ message: "Column is not created!" });
    }

    await Board.updateOne(
      { _id: boardId },
      {
        $push: { columns: column },
      },
    );

    res.status(200).json({ column });
  } catch (err) {
    res.status(500).json({ message: "Failed to create column" });
  }
};

exports.getColumns = async (req, res) => {
  const { boardId } = req.params;

  try {
    const columns = await Column.find({ boardId }).sort({ order: 1 });

    if (!columns) {
      res.status(404).json({ message: "Columns not found!" });
    }

    res.status(200).json({ columns });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch column" });
  }
};

exports.updateColumn = async (req, res) => {
  const { columnId } = req.params;
  const { updates } = req.body;

  const allowedFields = ["title"];

  filteredUpdates = {};

  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  }

  try {
    const column = await Column.findByIdAndUpdate(
      columnId,
      {
        $set: filteredUpdates,
      },
      { new: true },
    );

    if (!column) {
      res.status(404).json({ message: "Column not found" });
    }

    res.status(200).json({ column });
  } catch (err) {
    res.status(500).json({ message: "Failed to update column" });
  }
};

exports.copyColumn = async (req, res) => {
  const { columnId } = req.params;
  const { boardId, columnTitle } = req.body;

  try {
    const board = await Board.findById(boardId);

    if (!board) {
      res.status(404).json({ message: "Board not found!" });
    }

    const column = await Column.findById(columnId);

    if (!column) {
      res.status(404).json({ message: "Column not found" });
    }

    const count = await Column.countDocuments({ boardId });

    const copiedColumn = await Column.create({
      title: columnTitle,
      boardId,
      order: count,
      cards: [],
    });

    for (const cardId of column.cards) {
      const originalCard = await Card.findById(cardId);

      const newCard = await Card.create({
        title: originalCard.title,
        columnId: copiedColumn._id,
        order: originalCard.order,
      });

      await Column.updateOne(
        { _id: copiedColumn._id },
        { $push: { cards: newCard._id } },
      );
    }

    await Board.updateOne(
      { _id: boardId },
      { $push: { columns: copiedColumn._id } },
    );

    res.status(200).json({ copiedColumn });
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Failed to copy column" });
  }
};

exports.moveColumn = async (req, res) => {
  const { columnId } = req.params;
  const { targetBoardId, newOrder } = req.body;

  try {
    const column = await Column.findById(columnId);

    if (!column) {
      return res.status(404).json({ message: "Column not found" });
    }

    const oldBoardId = column.boardId;
    const oldOrder = column.order;

    if (oldBoardId.toString() === targetBoardId) {
      if (newOrder > oldOrder) {
        await Column.updateMany(
          {
            boardId: oldBoardId,
            order: { $gt: oldOrder, $lte: newOrder },
          },
          { $inc: { order: -1 } },
        );
      } else {
        await Column.updateMany(
          {
            boardId: oldBoardId,
            order: { $gte: newOrder, $lt: oldOrder },
          },
          { $inc: { order: 1 } },
        );
      }

      column.order = newOrder;
      await column.save();
    } else {
      await Column.updateMany(
        { boardId: oldBoardId, order: { $gt: oldOrder } },
        { $inc: { order: -1 } },
      );

      await Column.updateMany(
        { boardId: targetBoardId, order: { $gte: newOrder } },
        { $inc: { order: 1 } },
      );

      column.boardId = targetBoardId;
      column.order = newOrder;

      const sourceBoard = await Board.findById(oldBoardId);
      const targetBoard = await Board.findById(targetBoardId);

      sourceBoard.columns = sourceBoard.columns.filter(
        (id) => id.toString() !== columnId,
      );

      targetBoard.columns.splice(newOrder, 0, columnId);

      await sourceBoard.save();
      await targetBoard.save();

      await column.save();
    }

    const sourceColumns = await Column.find({ boardId: oldBoardId }).sort({
      order: 1,
    });

    const targetColumns = await Column.find({ boardId: targetBoardId }).sort({
      order: 1,
    });

    res.status(200).json({
      sourceColumns,
      targetColumns,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to move column" });
  }
};

exports.deleteColumn = async (req, res) => {
  const { columnId } = req.params;

  try {
    const column = await Column.findById(columnId);

    if (!column) {
      return res.status(404).json({ message: "Column not found" });
    }

    await Comment.deleteMany({ cardId: { $in: column.cards } });

    await Card.deleteMany({ _id: { $in: column.cards } });

    await Column.deleteOne({ _id: columnId });

    await Board.findByIdAndUpdate(column.boardId, {
      $pull: { columns: columnId },
    });

    res.status(200).json({ column });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete column" });
  }
};
