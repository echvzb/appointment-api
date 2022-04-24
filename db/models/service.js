const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  name: String,
  timeInMinutes: Number,
  businessId: mongoose.Schema.Types.ObjectId,
});

const Service = mongoose.model("Service", ServiceSchema);

module.exports = Service;
