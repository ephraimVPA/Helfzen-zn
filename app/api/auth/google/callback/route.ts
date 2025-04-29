import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyGoogleToken } from "@/lib/google-auth"
import { SignJWT } from "jose"

// Improved callback route with better error handling and logging
export async function GET(request: NextRequest) {
  try {
    console.log("Google OAuth callback started")

    // Get the authorization code from the URL
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const callbackUrl = searchParams.get("state") || "/dashboard"

    console.log("Callback URL:", callbackUrl)
    console.log("Authorization code exists:", !!code)

    if (!code) {
      console.error("Missing authorization code")
      return NextResponse.redirect(new URL("/login?error=missing_code", request.url))
    }

    // Verify the token and get user info
    console.log("Verifying Google token...")
    const user = await verifyGoogleToken(code)

    if (!user) {
      console.error("Failed to verify Google token or user not authorized")
      return NextResponse.redirect(new URL("/login?error=unauthorized", request.url))
    }

    console.log("User authenticated successfully:", user.email)

    // Create a JWT token using jose instead of jsonwebtoken
    console.log("Creating JWT token...")
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      commentAccess: user.commentAccess,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET)

    console.log("JWT token created")

    // Set the token in a cookie
    console.log("Setting auth-token cookie...")
    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    // Log the redirect
    console.log("Redirecting to:", callbackUrl)

    // Redirect to the callback URL or dashboard
    return NextResponse.redirect(new URL(callbackUrl, request.url))
  } catch (error) {
    console.error("Error in Google callback:", error)
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return NextResponse.redirect(new URL("/login?error=auth_error", request.url))
  }
}
