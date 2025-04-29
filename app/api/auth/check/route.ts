import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { checkUserCommentAccess } from "@/lib/google-sheets-users"

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Double-check if the user has comment access from the Google Sheet
    // This ensures we always have the latest permission from the sheet
    const hasCommentAccess = await checkUserCommentAccess(session.user.email)

    // Update the user object with the latest comment access
    const user = {
      ...session.user,
      commentAccess: hasCommentAccess,
    }

    return NextResponse.json({
      authenticated: true,
      user,
    })
  } catch (error) {
    console.error("Error checking authentication:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
