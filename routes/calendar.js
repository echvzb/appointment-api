const calendarRouter = require("express").Router();
const { google } = require("googleapis");

calendarRouter.get("/", async (req, res) => {
  const { accessToken } = req.user;
  const calendar = google.calendar({ version: "v3", auth: accessToken });
  const calendarList = await calendar.calendarList.list();
  res.json(calendarList.data.items);
});

module.exports = calendarRouter;
