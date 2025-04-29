import { type NextRequest, NextResponse } from "next/server"
import { updatePasswordHash, findUserByEmail } from "@/lib/google-sheets-users"

export async function POST(request: NextRequest) {
  try {
    console.log("Set password API route called")

    // Parse the request body
    let body
    try {
      body = await request.json()
      console.log("Set password request body:", {
        hasEmail: !!body.email,
        hasPassword: !!body.password,
      })
    } catch (e) {
      console.error("Error parsing request body:", e)
      return NextResponse.json({ message: "Invalid request format" }, { status: 400 })
    }

    const { email, password } = body || {}

    if (!email || !password) {
      console.log("Set password failed: Email and password are required")
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Verify the user exists
    const user = await findUserByEmail(email)

    if (!user) {
      console.log(`User ${email} not found in sheet`)
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Update the password hash
    const success = await updatePasswordHash(email, password)

    if (!success) {
      console.log(`Failed to update password for user ${email}`)
      return NextResponse.json({ message: "Failed to update password" }, { status: 500 })
    }

    console.log(`Successfully set password for user ${email}`)

    return NextResponse.json({
      message: "Password set successfully",
    })
  } catch (error) {
    console.error("Set password error:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json({ message: "An error occurred while setting the password" }, { status: 500 })
  }
}
