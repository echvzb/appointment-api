const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: String,
  profile: {
    name: String,
    image: String,
    email: String,
  },
  tokens: {
    accessToken: String,
    refreshToken: String,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
