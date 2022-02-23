const originsAllowed = [
  /^https:\/\/appointment-thaunze.netlify.app$/i,
  /^https:\/\/(\d|[a-z])+--appointment-thaunze.netlify.app$/i,
  /^http:\/\/localhost:3000$/i,
];

const allowCors = (req, res, next) => {
  const origin = req.headers.origin;
  for (const i in originsAllowed) {
    if (originsAllowed[i].test(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      break;
    }
  }
  next();
};

module.exports = allowCors;
