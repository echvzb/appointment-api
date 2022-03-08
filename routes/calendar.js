const calendarRouter = require("express").Router();
const { google } = require("googleapis");
const { getOAuth2Client } = require("../utils/authClient");
const formatRFC3339 = require("date-fns/formatRFC3339");
const sub = require("date-fns/sub");
const add = require("date-fns/add");

calendarRouter.get("/", async (req, res) => {
  const { tokens } = req.user;
  const { date } = req.query;
  const parsedDate = new Date(date);
  parsedDate.setHours(0, 0, 0, 0);
  const today = parsedDate.getDay();

  const firstDayOfTheWeek = sub(parsedDate, { days: today });
  const lastDayOfTheWeek = add(firstDayOfTheWeek, { days: 6 });
  lastDayOfTheWeek.setHours(23, 59, 59, 999);

  const oauth20Client = getOAuth2Client(tokens);
  const calendar = google.calendar({ version: "v3", auth: oauth20Client });

  try {
    const ownersEvents = await calendar.events.list({
      calendarId: "primary",
      timeMin: formatRFC3339(firstDayOfTheWeek),
      timeMax: formatRFC3339(lastDayOfTheWeek),
      singleEvents: true,
      orderBy: "startTime",
    });

    const { data } = ownersEvents;
    const items = Array(...data.items);
    const events = [[], [], [], [], [], [], []];

    for (const item of items) {
      if (item.start.dateTime) {
        const start = new Date(item.start.dateTime);
        const end = new Date(item.end.dateTime);
        const day = start.getDay();
        const currentDayEventsLength = events[day].length;
        const prevEvent =
          currentDayEventsLength > 0
            ? events[day][currentDayEventsLength - 1]
            : null;

        if (prevEvent) {
          const startTime = start.getTime();
          const endTime = end.getTime();

          const [prevStartDate, prevEndDate] = prevEvent
            .split("-")
            .map((time, i) => {
              const prevTimeDate = new Date(i === 0 ? startTime : endTime);
              prevTimeDate.setHours(...time.split(":").map(Number));
              return prevTimeDate;
            });

          const prevStartTime = prevStartDate.getTime();
          const prevEndTime = prevEndDate.getTime();

          if (startTime >= prevStartTime && startTime <= prevEndTime) {
            if (endTime >= prevEndTime) {
              events[day][currentDayEventsLength - 1] = `${
                prevEvent.split("-")[0]
              }-${end.getHours()}:${end.getMinutes()}`;
            }
            continue;
          }
        }
        const event =
          start.getHours() +
          ":" +
          start.getMinutes() +
          "-" +
          end.getHours() +
          ":" +
          end.getMinutes();
        events[day].push(event);
      }
    }
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = calendarRouter;
