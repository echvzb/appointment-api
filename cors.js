const cors = require("cors");

const originsAllowed = [
  /^https:\/\/appointment-thaunze.netlify.app$/i,
  /^https:\/\/(\d|[a-z])+--appointment-thaunze.netlify.app$/i,
];

if (process.env.NODE_ENV !== "production") {
  originsAllowed.push(/^http:\/\/localhost:3000$/i);
}

const allowCors = cors({
  origin: originsAllowed,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
});

module.exports = allowCors;
