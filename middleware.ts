import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// List of paths that don't require authentication
const publicPaths = ["/login", "/api/auth/login", "/api/auth/google", "/api/auth/google/callback"]

// This would normally come from environment variables
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if the path is public
  if (publicPaths.some((publicPath) => path === publicPath || path.startsWith(publicPath))) {
    return NextResponse.next()
  }

  // Check if the user is authenticated
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    // Redirect to login page if not authenticated
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.url)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify the token
    const verified = await jwtVerify(token, JWT_SECRET)

    // Check if the user has comment access when trying to access comment mode
    if (request.nextUrl.searchParams.has("commentMode") && request.nextUrl.searchParams.get("commentMode") === "true") {
      const payload = verified.payload
      const hasCommentAccess = payload.commentAccess === true

      if (!hasCommentAccess) {
        // Redirect to dashboard if user doesn't have comment access
        return NextResponse.redirect(new URL("/dashboard?error=no_comment_access", request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    // Token is invalid, redirect to login
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.url)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
