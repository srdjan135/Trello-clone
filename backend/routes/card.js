const express = require("express");
const router = express.Router();

const checkAuth = require("../middlewares/check-auth");
const {
  createCard,
  getCards,
  copyCard,
  updateCard,
  moveCard,
  sortCards,
  deleteCard,
} = require("../controllers/card");

router.post("/:columnId/cards", checkAuth, createCard);
router.get("/:columnId/cards", checkAuth, getCards);
router.post("/:cardId/copy", checkAuth, copyCard);
router.patch("/cards/:cardId", checkAuth, updateCard);
router.patch("/:cardId/move", checkAuth, moveCard);
router.patch("/cards/sort", checkAuth, sortCards);
router.delete("/:cardId/delete", checkAuth, deleteCard);
module.exports = router;
