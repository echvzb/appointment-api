const router = require("express").Router();
const {
  models: { Service },
} = require("../db");

router.use((req, res, next) => {
  if (req.user.config.isBusinessAccount) {
    next();
  } else {
    res.status(403).json({
      error: "The account is not a business account",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, timeInMinutes } = req.body;
    await Service.create({
      name,
      timeInMinutes,
      businessId: req.user._id,
    });
    res.status(201).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const services = await Service.find(
      {
        businessId: req.user._id,
      },
      "name timeInMinutes"
    );
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
