const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const authRouter = require("express").Router();
const googleAuthRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

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
        name: profile.displayName,
        image: profile.photos[0].value,
        accessToken,
        refreshToken,
      };
      try {
        const user = await User.findOne({ googleId: profile.id });
        if (!user) {
          const newUser = await User.create(newUserData);
          done(null, newUser);
        } else {
          for(const key in newUserData) {
            user[key] = newUserData[key];
          }
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
          "profile",
          "https://www.googleapis.com/auth/calendar",
          "https://www.googleapis.com/auth/calendar.events",
        ],
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
