const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  businessId: mongoose.Schema.Types.ObjectId,
  clientId: mongoose.Schema.Types.ObjectId,
  googleEventId: String,
  start: Date,
  end: Date,
});

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
