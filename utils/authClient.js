const { google } = require("googleapis");

const getOAuth2Client = (tokens) => {
  const oauth20Client = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  });
  oauth20Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });
  return oauth20Client;
};

module.exports = { getOAuth2Client };
