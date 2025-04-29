import { NextResponse } from "next/server"
import { getUsersFromSheet } from "@/lib/google-sheets-users"

export async function GET() {
  try {
    console.log("Debug users API route called")

    // Get all users from the sheet
    const users = await getUsersFromSheet()

    // Return sanitized user data (no password hashes)
    return NextResponse.json({
      userCount: users.length,
      users: users.map((user) => ({
        email: user.email,
        name: user.name,
        role: user.role,
        commentAccess: user.commentAccess,
        hasPassword: !!user.password_hash,
      })),
    })
  } catch (error) {
    console.error("Debug users error:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json({ message: "An error occurred while fetching users" }, { status: 500 })
  }
}
