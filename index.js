const express = require("express");
const logger = require("morgan");
const passport = require("passport");
const cors = require("./cors");

if (process.env.NODE_ENV !== "production") require("dotenv").config();

const app = express();
const db = require("./db");
const routes = require("./routes");

db.start();

app
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(cors)
  .use(logger("dev"))
  .use(passport.initialize())
  .use("/api/v1", routes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("Server is running on port:", PORT);
});
