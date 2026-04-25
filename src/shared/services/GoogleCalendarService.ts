import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // http://localhost:3333/google/callback
);

// Scopes necessários para gerir a agenda
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

export const generateAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Importante para receber o Refresh Token
    scope: SCOPES,
    prompt: 'consent'
  });
};

export const getTokens = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens; // Contém access_token e refresh_token
};