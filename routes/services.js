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

router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findOne(
      {
        _id: req.params.id,
        businessId: req.user._id,
      },
      "name timeInMinutes"
    );
    if (!service) {
      res.status(404).json({ error: "Service not found" });
    } else {
      res.status(200).json(service);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Service.findByIdAndDelete(id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
