import { NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"
import { nanoid } from "nanoid"

// The ID of the Google Sheet
const SPREADSHEET_ID = "1oiQo_Sn7PwI3tl-3TKr1Z7SmT5KdWXFCfqcopQ1M1oM"
const SHEET_NAME = "Comments"

export async function POST(request: Request) {
  try {
    console.log("Testing add comment to Google Sheets...")

    // Parse the request body
    const body = await request.json()
    const { text, elementId, path, position } = body

    // Validate required fields
    if (!text || !elementId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          details: {
            textProvided: !!text,
            elementIdProvided: !!elementId,
          },
        },
        { status: 400 },
      )
    }

    // Get credentials from environment variables
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY

    if (!clientEmail || !privateKey) {
      console.error("Missing Google Sheets credentials")
      return NextResponse.json(
        {
          success: false,
          error: "Missing credentials",
          details: {
            clientEmailExists: !!clientEmail,
            privateKeyExists: !!privateKey,
          },
        },
        { status: 500 },
      )
    }

    // Fix private key formatting - handle different possible formats
    let formattedPrivateKey = privateKey
    if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      formattedPrivateKey = privateKey.replace(/\\n/g, "\n").replace(/\n/g, "\n").replace(/""/g, '"')
    }

    console.log("Private key format check:")
    console.log("- Contains BEGIN marker:", formattedPrivateKey.includes("-----BEGIN PRIVATE KEY-----"))
    console.log("- Contains END marker:", formattedPrivateKey.includes("-----END PRIVATE KEY-----"))

    // Initialize the JWT client
    const client = new JWT({
      email: clientEmail,
      key: formattedPrivateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    // Test authentication
    console.log("Testing Google authentication...")
    try {
      await client.authorize()
      console.log("Google authentication successful")
    } catch (authError) {
      console.error("Google authentication failed:", authError)
      return NextResponse.json(
        {
          success: false,
          error: "Authentication failed",
          details: authError instanceof Error ? authError.message : "Unknown error",
        },
        { status: 401 },
      )
    }

    // Initialize Google Sheets
    const sheets = google.sheets({ version: "v4", auth: client })

    // Ensure the Comments sheet exists
    console.log("Ensuring Comments sheet exists...")
    try {
      // Check if the sheet exists
      const response = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      })

      const sheetExists = response.data.sheets?.some((sheet) => sheet.properties?.title === SHEET_NAME)

      if (!sheetExists) {
        // Create the sheet
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: SHEET_NAME,
                  },
                },
              },
            ],
          },
        })

        // Add headers
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A1:I1`,
          valueInputOption: "RAW",
          requestBody: {
            values: [["ID", "ElementID", "Text", "Path", "UserID", "UserName", "CreatedAt", "Position", "Element"]],
          },
        })
      }

      // Create comment data
      const commentId = nanoid()
      const now = new Date().toISOString()
      const userId = "test-user"
      const userName = "Test User"

      // Add the comment to the sheet
      console.log("Adding comment to sheet...")
      const appendResponse = await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:I`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            [
              commentId,
              elementId,
              text,
              path || "/test",
              userId,
              userName,
              now,
              JSON.stringify(position || { x: 0, y: 0 }),
              "",
            ],
          ],
        },
      })

      console.log("Comment added successfully")
      return NextResponse.json({
        success: true,
        message: "Comment added successfully",
        commentId,
        details: {
          updatedRange: appendResponse.data.updates?.updatedRange,
          updatedCells: appendResponse.data.updates?.updatedCells,
        },
      })
    } catch (error) {
      console.error("Error adding comment to sheet:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to add comment",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in add-comment API route:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Request failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
