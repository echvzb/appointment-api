const express = require("express");
const logger = require("morgan");
const session = require("cookie-session");
const passport = require("passport");
const cors = require("./cors");
const cookieParser = require("cookie-parser");

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
      name: "session",
      secret: process.env.SESSION_SECRET,
      maxAge: 24 * 60 * 60 * 1000,
    })
  )
  .use(cookieParser())
  .use(passport.authenticate("session"))
  .use("/api/v1", routes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("Server is running on port:", PORT);
});
