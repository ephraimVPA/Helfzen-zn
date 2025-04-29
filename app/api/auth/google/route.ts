import { type NextRequest, NextResponse } from "next/server"
import { getGoogleAuthUrl } from "@/lib/google-auth"

export async function GET(request: NextRequest) {
  try {
    console.log("Google OAuth initiation started")

    // Get the callback URL from the state parameter
    const searchParams = request.nextUrl.searchParams
    const state = searchParams.get("state") || "/dashboard"
    console.log("State (callback URL):", state)

    // Generate the Google OAuth URL
    const authUrl = getGoogleAuthUrl(state)
    console.log("Redirecting to Google OAuth URL")

    // Redirect to Google's OAuth page
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Error initiating Google OAuth:", error)
    return NextResponse.redirect(new URL("/login?error=auth_error", request.url))
  }
}
