const { google } = require("googleapis");

const getOAuth2Client = (access_token) => {
  const oauth20Client = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  });
  oauth20Client.setCredentials({
    access_token,
  });
  return oauth20Client;
};

module.exports = { getOAuth2Client };
