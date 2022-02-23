const mongoose = require("mongoose");

exports.start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
};

exports.models = require("./models");
