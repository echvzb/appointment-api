const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const router = require("express").Router();
const {
  models: { User },
} = require("../db");

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
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ googleId: profile.id });
        if (!user) {
          const newUser = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            image: profile.photos[0].value,
            accessToken,
          });
          done(null, newUser);
        }
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

router
  .get(
    "/",
    (req, res, next) => {
      if (req.user) res.redirect("/user");
      else next();
    },
    passport.authenticate("google", { scope: ["profile"] })
  )
  .get(
    "/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/user");
    }
  );

module.exports = router;
