const Card = require("../models/card");
const Column = require("../models/column");

exports.createCard = async (req, res) => {
  const { cardTitle } = req.body;
  const { columnId } = req.params;

  try {
    const column = await Column.findById(columnId);

    if (!column) {
      res.status(404).json({ message: "Column not found!" });
    }

    const count = await Card.countDocuments({ columnId });

    const card = await Card.create({
      title: cardTitle,
      columnId,
      order: count,
    });

    if (!card) {
      res.status(404).json({ message: "Card not found!" });
    }

    await Column.updateOne(
      { _id: columnId },
      {
        $push: { cards: card },
      },
    );

    res.status(200).json({ card });
  } catch (err) {
    res.status(500).json({ message: "Failed to create card!" });
  }
};

exports.getCards = async (req, res) => {
  const { columnId } = req.params;

  try {
    const cards = await Card.find({ columnId }).sort({ order: 1 });

    if (!cards) {
      res.status(404).json({ message: "Cards not found!" });
    }

    res.status(200).json({ cards });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch card!" });
  }
};

exports.moveCard = async (req, res) => {
  const { cardId } = req.params;
  const { columnId, order } = req.body;

  try {
    const card = await Card.findById(cardId);

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    card.columnId = columnId;
    await card.save();

    let cards = await Card.find({ columnId }).sort({ order: 1 });

    cards = cards.filter((c) => c._id.toString() !== cardId);

    cards.splice(order, 0, card);

    await Promise.all(
      cards.map((c, index) => {
        c.order = index;
        return c.save();
      }),
    );

    const updatedCards = await Card.find({ columnId }).sort({ order: 1 });

    res.json({ cards: updatedCards });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
