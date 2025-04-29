import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyGoogleToken } from "@/lib/google-auth"
import { SignJWT } from "jose"

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = request.nextUrl
    const code  = searchParams.get("code")
    const state = searchParams.get("state") // our encoded callback

    // 1️⃣  Safety checks
    if (!code) {
      return NextResponse.redirect(new URL("/login?error=missing_code", request.url))
    }

    // 2️⃣  Exchange code ➜ user profile
    const user = await verifyGoogleToken(code)
    if (!user) {
      return NextResponse.redirect(new URL("/login?error=unauthorized", request.url))
    }

    // 3️⃣  Build JWT for 7 days
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "secret")
    const token = await new SignJWT({
      userId: user.id,
      email:  user.email,
      name:   user.name,
      role:   user.role,
      commentAccess: user.commentAccess,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET)

    cookies().set("auth-token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      path:     "/",
      maxAge:   60 * 60 * 24 * 7, // 7 days
    })

    // 4️⃣  Decode the state (= callbackUrl) **once**
    const decoded = state ? decodeURIComponent(state) : "/dashboard"
    // If it’s a relative path like "/" ➜ make absolute
    const finalUrl = decoded.startsWith("http") ? decoded : `${origin}${decoded}`

    return NextResponse.redirect(finalUrl)
  } catch (err) {
    console.error("Google callback failed", err)
    return NextResponse.redirect(new URL("/login?error=auth_error", request.url))
  }
}
