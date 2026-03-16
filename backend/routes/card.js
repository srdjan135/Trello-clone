const express = require("express");
const router = express.Router();

const checkAuth = require("../middlewares/check-auth");
const {
  createCard,
  getCards,
  moveCard,
  sortCards,
} = require("../controllers/card");

router.post("/:columnId/cards", checkAuth, createCard);
router.get("/:columnId/cards", checkAuth, getCards);
router.patch("/:cardId/move", checkAuth, moveCard);
router.patch("/cards/sort", checkAuth, sortCards);

module.exports = router;
