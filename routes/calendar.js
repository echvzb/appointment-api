const calendarRouter = require("express").Router();
const { google } = require("googleapis");
const { getOAuth2Client } = require("../utils/authClient");
const formatRFC3339 = require("date-fns/formatRFC3339");
const sub = require("date-fns/sub");
const add = require("date-fns/add");
const {
  models: { User, Event, Service },
} = require("../db");
const { parseGoogleDate, getDateFromDateString } = require("../utils/date");

calendarRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const {
      config: { timeZone },
    } = req.user;
    const { tokens } = user;
    const { date } = req.query;
    const [year, month, day] = date.split("-");
    const parsedDate = new Date(Date.UTC(+year, +month - 1, +day, 0, 0, 0, 0));

    const firstDayOfTheWeek = sub(parsedDate, { days: parsedDate.getDay() });
    const lastDayOfTheWeek = add(firstDayOfTheWeek, { days: 6 });
    lastDayOfTheWeek.setHours(23, 59, 59, 999);

    const oauth20Client = getOAuth2Client(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth20Client });

    const ownersEvents = await calendar.events.list({
      calendarId: "primary",
      timeMin: formatRFC3339(firstDayOfTheWeek),
      timeMax: formatRFC3339(lastDayOfTheWeek),
      singleEvents: true,
      orderBy: "startTime",
      timeZone,
    });
    const { data } = ownersEvents;
    const items = Array(...data.items);
    const events = [[], [], [], [], [], [], []];

    for (const item of items) {
      let isDeclined = false;
      if (item.attendees) {
        for (const attendee of item.attendees) {
          if (attendee.self) {
            if (attendee.responseStatus === "declined") {
              isDeclined = true;
            }
            break;
          }
        }
      }
      if (item.start.dateTime && !isDeclined) {
        const start = parseGoogleDate(item.start.dateTime);
        const end = parseGoogleDate(item.end.dateTime);
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

calendarRouter.post("/:userId/event", async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, serviceId } = req.body;
    const businessUser = await User.findById(userId);
    const service = await Service.findById(serviceId);
    if (!businessUser || !service) {
      res.status(404).json({ error: "User or service not found" });
    } else {
      const {
        _id: businessId,
        profile: businessProfile,
        tokens,
      } = businessUser;
      const {
        _id: clientId,
        config: { timeZone },
        profile: clientProfile,
      } = req.user;

      const start = getDateFromDateString(date, timeZone);
      const end = add(start, { minutes: service.timeInMinutes });
      const event = {
        summary: service.name + " - Appointment App",
        description: "",
        start: {
          dateTime: formatRFC3339(start),
        },
        end: {
          dateTime: formatRFC3339(end),
        },
        attendees: [
          {
            email: clientProfile.email,
            displayName: clientProfile.name,
            responseStatus: "accepted",
          },
          {
            email: businessProfile.email,
          },
        ],
      };
      const oauth20Client = getOAuth2Client(tokens);
      const calendar = google.calendar({ version: "v3", auth: oauth20Client });

      const eventResponse = await calendar.events.insert({
        calendarId: "primary",
        sendNotifications: true,
        sendUpdates: "all",
        requestBody: event,
      });

      await Event.create({
        businessId,
        clientId,
        googleEventId: eventResponse.data.id,
        start,
        end,
      });

      res.status(201).json({ eventResponse, start, end });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = calendarRouter;
