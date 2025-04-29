import { type NextRequest, NextResponse } from "next/server"
import { findUserByEmail, isNewUser, verifyPassword } from "@/lib/google-sheets-users"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import jwt from "jsonwebtoken"

// Simple in-memory session store (would use a database in production)
const sessions: Record<string, { userId: string; email: string }> = {}

export async function POST(request: NextRequest) {
  try {
    console.log("Login API route called")

    // Parse the request body
    let body
    try {
      body = await request.json()
      console.log("Login request body:", {
        email: body.email,
        hasPassword: !!body.password,
      })
    } catch (e) {
      console.error("Error parsing request body:", e)
      return NextResponse.json({ message: "Invalid request format" }, { status: 400 })
    }

    const { email, password } = body || {}

    if (!email) {
      console.log("Login failed: Email is required")
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Find the user in the sheet
    const user = await findUserByEmail(email)

    if (!user) {
      console.log(`User ${email} not found in sheet`)
      return NextResponse.json(
        {
          message: "User not found. Only users listed in the system can log in.",
          error: "user_not_found",
        },
        { status: 401 },
      )
    }

    console.log(`User ${email} found in sheet`)

    // Check if this is a new user (no password set)
    const userIsNew = await isNewUser(email)

    // For new users, we allow login without a password
    if (userIsNew) {
      console.log(`New user ${email} logging in for the first time - no password required`)

      // Create a session for the new user
      const sessionId = uuidv4()
      sessions[sessionId] = { userId: sessionId, email: user.email }

      // Create a JWT token
      const token = jwt.sign(
        { userId: sessionId, email: user.email, role: user.role },
        process.env.JWT_SECRET || "default-secret",
        { expiresIn: "7d" },
      )

      // Set the token in a cookie
      cookies().set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      })

      return NextResponse.json({
        user: {
          id: sessionId,
          email: user.email,
          name: user.name,
          role: user.role,
          commentAccess: user.commentAccess,
        },
        isNewUser: true,
        message: "First-time login successful. Please set your password.",
      })
    } else {
      // For existing users, require a password
      if (!password) {
        console.log(`Login failed: Password is required for existing user ${email}`)
        return NextResponse.json({ message: "Password is required" }, { status: 400 })
      }

      // Verify the password
      const isValid = await verifyPassword(email, password)

      if (!isValid) {
        console.log(`Invalid credentials for user ${email}`)
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
      }

      console.log(`Successfully verified password for user ${email}`)

      // Create a session for the user
      const sessionId = uuidv4()
      sessions[sessionId] = { userId: sessionId, email: user.email }

      // Create a JWT token
      const token = jwt.sign(
        { userId: sessionId, email: user.email, role: user.role },
        process.env.JWT_SECRET || "default-secret",
        { expiresIn: "7d" },
      )

      // Set the token in a cookie
      cookies().set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      })

      return NextResponse.json({
        user: {
          id: sessionId,
          email: user.email,
          name: user.name,
          role: user.role,
          commentAccess: user.commentAccess,
        },
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json({ message: "An error occurred during login" }, { status: 500 })
  }
}
