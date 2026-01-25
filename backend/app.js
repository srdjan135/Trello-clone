const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

//import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const workspaceRoutes = require("./routes/workspace");
const boardRoutes = require("./routes/board");

const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

//CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "PUT, POST, GET, PATCH, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self';");
  next();
});

//ROUTES
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", workspaceRoutes);
app.use("/api", boardRoutes);

const PORT = 3000;
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PW}@cluster0.qslixxe.mongodb.net/trelloClone`,
  )
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log("server radi!!!");
    });
  });
