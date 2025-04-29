import { NextResponse } from "next/server"
import { debugSpreadsheetId, getUsersFromSheet } from "@/lib/google-sheets-users"

export async function GET() {
  try {
    console.log("Debug endpoint called for Google Sheets")

    // Debug the spreadsheet ID
    await debugSpreadsheetId()

    // Try to get users
    console.log("Attempting to fetch users from sheet...")
    const users = await getUsersFromSheet()

    // Return the results (sanitized for security)
    return NextResponse.json({
      success: true,
      message: "Debug information logged to console",
      userCount: users.length,
      // Only return non-sensitive user data
      sampleUsers: users.slice(0, 3).map((user) => ({
        email: user.email,
        name: user.name,
        role: user.role,
        commentAccess: user.commentAccess,
        hasPassword: !!user.password_hash,
      })),
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error occurred, check server logs",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
