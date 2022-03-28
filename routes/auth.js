const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const authRouter = require("express").Router();
const googleAuthRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const { google } = require("googleapis");
const { getOAuth2Client } = require("../utils/authClient");

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.SESSION_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        const user = await User.findById(token.id);
        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

const {
  models: { User },
} = require("../db");

const BASE_URL = process.env.BASE_URL || "";

passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser(async (_id, done) => {
  try {
    const user = await User.findById(_id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: BASE_URL + "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const newUserData = {
        googleId: profile.id,
        profile: {
          name: profile.displayName,
          image: profile.photos[0].value,
          email: profile.emails[0].value,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
      const oauth2Client = getOAuth2Client(newUserData.tokens);
      const calendar = google.calendar({
        version: "v3",
        auth: oauth2Client,
      });
      const params = {
        resource: {
          summary: "Appointment App",
        },
      };
      try {
        const user = await User.findOne({ googleId: profile.id });
        if (!user) {
          const newCalendar = await calendar.calendars.insert(params);
          const primaryCalendar = await calendar.calendars.get({
            calendarId: "primary",
          });
          const newUser = await User.create({
            ...newUserData,
            config: {
              timeZone: primaryCalendar.data.timeZone,
              appointmentCalendarId: newCalendar.data.id,
            },
          });
          done(null, newUser);
        } else {
          user.profile = newUserData.profile;
          if (refreshToken) user.tokens = newUserData.tokens;
          else user.tokens.accessToken = accessToken;
          await user.save();
          done(null, user);
        }
      } catch (err) {
        done(err);
      }
    }
  )
);

googleAuthRouter
  .get("/", (req, res, next) => {
    if (req.user) res.redirect(BASE_URL + "/user");
    else {
      const state = Buffer.from(JSON.stringify(req.query)).toString("base64");
      const authenticator = passport.authenticate("google", {
        scope: [
          "email",
          "profile",
          "https://www.googleapis.com/auth/calendar",
          "https://www.googleapis.com/auth/calendar.events",
        ],
        accessType: "offline",
        state,
      });
      authenticator(req, res, next);
    }
  })
  .get(
    "/callback",
    passport.authenticate("google", {
      failureRedirect: "/",
    }),
    (req, res) => {
      const { state } = req.query;
      if (state) {
        const stateJSON = JSON.parse(
          Buffer.from(state, "base64").toString("utf8")
        );
        const token = jwt.sign(
          { id: req.user._id },
          process.env.SESSION_SECRET,
          {
            expiresIn: 60 * 60 * 24,
          }
        );
        res.redirect(stateJSON.origin + "?token=" + token);
      } else {
        res.redirect(BASE_URL + "/user");
      }
    }
  );

authRouter.use("/google", googleAuthRouter);

module.exports = authRouter;
