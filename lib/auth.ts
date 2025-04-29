import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"
import {
  findUserByEmail,
  verifyUserPassword,
  isNewUser,
  hashPassword,
  updateUserPasswordHash,
} from "./google-sheets-users"

// This would normally come from environment variables
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

export interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  commentAccess: boolean
  isNewUser: boolean
}

export interface Session {
  user: User
}

// Sign in a user
export async function signIn(email: string, password: string): Promise<User | null> {
  try {
    console.log(`Signing in user: ${email}`)

    // Find the user in the Google Sheet
    const sheetUser = await findUserByEmail(email)

    if (!sheetUser) {
      console.log(`User with email ${email} not found in sheet during signIn`)
      return null
    }

    console.log(`Found user in sheet: ${sheetUser.email}`)

    // Check if this is a new user (no password set)
    const userIsNew = await isNewUser(email)
    console.log(`User ${email} is new: ${userIsNew}`)

    if (userIsNew) {
      // For a new user, allow them to sign in without a password
      console.log(`New user ${email} signing in for the first time`)

      // If a password was provided, set it for the user
      if (password && password.trim() !== "") {
        console.log(`Setting initial password for new user ${email}`)
        const hashedPassword = await hashPassword(password)
        const updated = await updateUserPasswordHash(email, hashedPassword)

        if (!updated) {
          console.error(`Failed to update password for new user ${email}`)
        } else {
          console.log(`Set initial password for new user ${email}`)
        }
      }
    } else {
      // For existing users, verify the password
      console.log(`Verifying password for existing user ${email}`)
      const passwordValid = await verifyUserPassword(email, password)

      if (!passwordValid) {
        console.log(`Invalid password for user ${email}`)
        return null
      }

      console.log(`Password verified for user ${email}`)
    }

    // Create user object
    const user: User = {
      id: `user-${Date.now()}`,
      name: sheetUser.name || email.split("@")[0],
      email,
      role: sheetUser.role === "admin" ? "admin" : "user",
      commentAccess: sheetUser.commentAccess.toUpperCase() === "TRUE",
      isNewUser: userIsNew,
    }

    console.log(`Created user object for ${email}:`, {
      name: user.name,
      role: user.role,
      commentAccess: user.commentAccess,
      isNewUser: user.isNewUser,
    })

    // Create a JWT token
    const token = await new SignJWT({ user })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET)

    // Set the token as a cookie
    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    console.log(`Successfully signed in user ${email}`)
    return user
  } catch (error) {
    console.error("Error signing in user:", error)
    return null
  }
}

// Sign out a user
export async function signOut(): Promise<void> {
  cookies().delete("auth-token")
}

// Get the current session
export async function auth(): Promise<Session | null> {
  try {
    const token = cookies().get("auth-token")?.value

    if (!token) {
      return null
    }

    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload.user ? { user: verified.payload.user as User } : null
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}
