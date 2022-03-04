const calendarRouter = require("express").Router();
const { google } = require("googleapis");
const { getOAuth2Client } = require("../utils/authClient");

calendarRouter.get("/", async (req, res) => {
  const oauth20Client = getOAuth2Client(req.user.accessToken);
  const calendar = google.calendar({ version: "v3", auth: oauth20Client });
  try {
    const calendarList = await calendar.calendarList.list();
    res.json(calendarList.data.items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = calendarRouter;
