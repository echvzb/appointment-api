const router = require("express").Router();

router.use("/auth/google", require("./auth"));

router.get("/", (req, res) => {
  if (req.user) res.redirect("/user");
  else res.json({ hello: "world" });
});
router.get("/user", (req, res) => {
  if (!req.user) res.redirect("/");
  else res.json(req.user);
});
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
