import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client({
  client_id: process.env.CLIENT_ID
});

export async function verifyToken(token: string) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email_verified) {
      return null; 
    }
  
    return payload;
  } catch (error) {
    console.error("Google Token Verification Error:", error);
    return null;
  }
}