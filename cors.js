const cors = require("cors");

const originsAllowed = [
  /^https:\/\/appointment-thaunze.netlify.app$/i,
  /^https:\/\/(\d|[a-z])+--appointment-thaunze.netlify.app$/i,
  /^http:\/\/localhost:3000$/i,
];

const allowCors = cors({
  origin: originsAllowed,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
});

module.exports = allowCors;
