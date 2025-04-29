// ✅ lib/google-auth.ts (complete, child‑friendly version)
// This file does TWO jobs:
// 1. Build the Google login link (getGoogleAuthUrl)
// 2. After Google sends us back, check the user (verifyGoogleToken)

import { google } from "googleapis" // Google helper SDK
import { OAuth2Client } from "google-auth-library" // Low‑level OAuth client
import { findUserByEmail } from "./google-sheets-users" // Our sheet lookup

// Grab secrets from .env (you will paste these there)
const googleClientId = process.env.GOOGLE_CLIENT_ID!
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!
// Where Google should send the user back after login
const redirectUri = process.env.REDIRECT_URI || "http://localhost:3000/api/auth/google/callback"

// Set up the OAuth client once
export const oAuth2Client = new OAuth2Client(googleClientId, googleClientSecret, redirectUri)

// 🔗 1) Build the Google login URL that we send the user to
export function getGoogleAuthUrl(state = "") {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ]

  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    state, // we store our own callback URL inside state
  })
}

// ✅ 2) After Google returns with a CODE, swap it for the user’s profile
export async function verifyGoogleToken(code: string) {
  try {
    // A. Exchange code → tokens
    const { tokens } = await oAuth2Client.getToken(code)
    oAuth2Client.setCredentials(tokens)

    // B. Pull the user’s profile (email, name, id)
    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client })
    const { data } = await oauth2.userinfo.get()

    if (!data.email) {
      console.error("Google profile came back without an email – cannot continue")
      return null
    }

    // C. Check if this email is in our Google Sheet whitelist
    const allowedUser = await findUserByEmail(data.email)
    if (!allowedUser) {
      // Not on the list → block
      console.log(`User ${data.email} is NOT on the whitelist – access denied`)
      return null
    }

    // D. Build the user object that our callback route will store in a JWT
    return {
      id: data.id || "", // Google id can be undefined, fallback to empty
      email: data.email,
      name: data.name || "",
      role: allowedUser.role,
      commentAccess: allowedUser.commentAccess === "TRUE",
    }
  } catch (err) {
    console.error("verifyGoogleToken failed:", err)
    return null
  }
}

// ➡️  Done!  The rest of the app calls getGoogleAuthUrl() and verifyGoogleToken()
