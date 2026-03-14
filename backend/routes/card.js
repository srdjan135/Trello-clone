const express = require("express");
const router = express.Router();

const checkAuth = require("../middlewares/check-auth");
const { createCard, getCards, moveCard } = require("../controllers/card");

router.post("/:columnId/cards", checkAuth, createCard);
router.get("/:columnId/cards", checkAuth, getCards);
router.patch("/:cardId/move", checkAuth, moveCard);

module.exports = router;
