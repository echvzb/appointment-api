const router = require("express").Router();

router.use("/auth/google", require("./auth"));

router.get("/user", (req, res) => {
  if (!req.user) res.status(401).json({ error: "Unauthorized" });
  else res.json(req.user);
});
router.get("/logout", (req, res) => {
  if (req.user) {
    req.logout();
  } else {
    res.status(401);
  }
  res.end();
});

module.exports = router;
