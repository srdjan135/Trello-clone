const express = require("express");
const router = express.Router();

const checkAuth = require("../middlewares/check-auth");
const {
  createColumn,
  getColumns,
  updateColumn,
  copyColumn,
  moveColumn,
} = require("../controllers/column");

router.post("/:boardId/columns", checkAuth, createColumn);
router.get("/:boardId/columns", checkAuth, getColumns);
router.patch("/board/:columnId", checkAuth, updateColumn);
router.post("/columns/:columnId/copy", checkAuth, copyColumn);
router.patch("/columns/:columnId/move", checkAuth, moveColumn);

module.exports = router;
