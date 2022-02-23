const express = require("express");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const cors = require("./cors");

if (process.env.NODE_ENV !== "production") require("dotenv").config();

const app = express();
const db = require("./db");
const routes = require("./routes");

db.start();

app
  .use(cors)
  .use(logger("dev"))
  .use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  )
  .use(passport.authenticate("session"))
  .use("/api/v1", routes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("Server is running on port:", PORT);
});
