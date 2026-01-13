const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.get("/", (req, res) => {
  res.json("Backend radi");
});

const PORT = 3000;
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PW}@cluster0.qslixxe.mongodb.net/trelloClone`
  )
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log("server radi!!!");
    });
  });
