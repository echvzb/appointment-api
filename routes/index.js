const express = require("express");
const router = express.Router();
const protectedRouter = express.Router();
const passport = require("passport");

protectedRouter.use(passport.authenticate("jwt", { session: false }));

protectedRouter.get("/user", (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
  } else {
    const { profile } = req.user;
    res.json(profile);
  }
});

protectedRouter.use("/calendar", require("./calendar"));

router.use("/auth", require("./auth"));
router.use(protectedRouter);

module.exports = router;
