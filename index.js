const express = require("express");

if (process.env.NODE_ENV !== "production") require("dotenv").config();

const app = express();

const routes = require("./routes");

app.use(routes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("Server is running on port:", PORT);
});
