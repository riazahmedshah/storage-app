import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});

export async function verifyToken(token: string) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID,
  });

  const userInfo = ticket.getPayload();
  return userInfo;
}