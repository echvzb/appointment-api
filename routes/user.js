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

router.get("/config", (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
  } else {
    const {
      config: { timeZone, isBusinessAccount },
    } = req.user;
    res.json({ timeZone, isBusinessAccount });
  }
});

router.patch("/config", async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
    } else {
      const { config } = req.user;
      const { config: newConfig } = req.body;
      const user = await User.findById(req.user.id);
      let isError = false;
      for (const key of Object.keys(newConfig)) {
        if (!(key in config)) {
          res.status(400);
          isError = true;
          break;
        }
        user.config[key] = newConfig[key];
      }
      if (!isError) {
        await user.save();
      }
      res.end();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user._id }, "config.isBusinessAccount": true },
      "_id profile config"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId, "profile");
    if (!user) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.json(user.profile);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
