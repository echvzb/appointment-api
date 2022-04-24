const router = require("express").Router();
const {
  models: { Service },
} = require("../db");

router.post("/", async (req, res) => {
  try {
    if (req.user.config.isBusinessAccount) {
      const { name, timeInMinutes } = req.body;
      await Service.create({
        name,
        timeInMinutes,
        businessId: req.user._id,
      });
      res.status(201).end();
    } else {
      res.status(403).json({ error: "the account is not a business account" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
