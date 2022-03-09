const router = require("express").Router();
const {
  models: { User },
} = require("../db");

router.get("/", (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
  } else {
    const { profile } = req.user;
    res.json(profile);
  }
});
router.get("/all", async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user._id } },
      "_id profile"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
