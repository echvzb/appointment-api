const express = require("express");
const router = express.Router();
const protectedRouter = express.Router();
const passport = require("passport");

protectedRouter.use(passport.authenticate("jwt", { session: false }));

protectedRouter.use("/calendar", require("./calendar"));
protectedRouter.use("/user", require("./user"));
protectedRouter.use("/services", require("./services"));

router.use("/auth", require("./auth"));
router.use(protectedRouter);

module.exports = router;
