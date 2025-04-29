import { OAuth2Client } from "google-auth-library"
import { findUserByEmail, addUserIfNotExists } from "./google-sheets-users"

// Google OAuth client configuration
export const googleClientId = process.env.GOOGLE_CLIENT_ID || ""
export const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || ""
export const redirectUri = process.env.REDIRECT_URI || "http://localhost:3000/api/auth/google/callback"

// Create OAuth client
export const oAuth2Client = new OAuth2Client(googleClientId, googleClientSecret, redirectUri)

// Log configuration on module load
console.log("Google OAuth configuration:")
console.log("- Client ID exists:", !!googleClientId)
console.log("- Client Secret exists:", !!googleClientSecret)
console.log("- Redirect URI:", redirectUri)

// Generate Google OAuth URL
export function getGoogleAuthUrl(state = "") {
  console.log("Generating Google OAuth URL with state:", state)

  const scopes = ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    state: state,
  })

  console.log("Generated auth URL:", authUrl)
  return authUrl
}

// Verify Google token and get user info
export async function verifyGoogleToken(code: string) {
  try {
    console.log("Verifying Google token...")

    // Exchange code for tokens
    console.log("Getting tokens with code...")
    const { tokens } = await oAuth2Client.getToken(code)
    console.log("Received tokens:", !!tokens.access_token, !!tokens.refresh_token)

    oAuth2Client.setCredentials(tokens)

    // Get user info
    console.log("Fetching user info...")
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      console.error("Failed to fetch user info:", userInfoResponse.status, userInfoResponse.statusText)
      throw new Error("Failed to fetch user info")
    }

    const userInfo = await userInfoResponse.json()
    console.log("Received user info:", userInfo.email)

    // Check if user exists in our sheet
    console.log("Finding user in sheet:", userInfo.email)
    let user = await findUserByEmail(userInfo.email)

    if (!user) {
      console.log(`User ${userInfo.email} not found in sheet, attempting to add`)
      // Try to add the user to the sheet
      user = await addUserIfNotExists(userInfo.email, userInfo.name || "")

      if (!user) {
        console.error("Failed to add user to sheet")
        return null
      }

      console.log("Added new user to sheet")
    }

    // Return user info with additional data from our sheet
    console.log("Returning user info for:", userInfo.email)
    return {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name || user.name,
      picture: userInfo.picture,
      role: user.role,
      commentAccess: user.commentAccess.toUpperCase() === "TRUE",
    }
  } catch (error) {
    console.error("Error verifying Google token:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return null
  }
}
