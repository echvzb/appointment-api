const calendarRouter = require("express").Router();
const { google } = require("googleapis");

calendarRouter.get("/", async (req, res) => {
  const { accessToken } = req.user;
  const oauth20Client = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  });
  oauth20Client.setCredentials({
    access_token: accessToken,
  });
  const calendar = google.calendar({ version: "v3", auth: oauth20Client });
  try {
    const calendarList = await calendar.calendarList.list();
    res.json(calendarList.data.items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = calendarRouter;
