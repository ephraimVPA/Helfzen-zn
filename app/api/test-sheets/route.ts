import { NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

// The ID of the Google Sheet
const SPREADSHEET_ID = "1oiQo_Sn7PwI3tl-3TKr1Z7SmT5KdWXFCfqcopQ1M1oM"
const SHEET_NAME = "Test"

export async function GET() {
  try {
    console.log("Testing Google Sheets connection...")

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

    // Log the first and last few characters of the private key for debugging
    const privateKeyLength = privateKey.length
    const privateKeyPreview = `${privateKey.substring(0, 20)}...${privateKey.substring(privateKeyLength - 20)}`
    console.log("Private key preview:", privateKeyPreview)

    // Fix private key formatting - handle different possible formats
    let formattedPrivateKey = privateKey
    if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      formattedPrivateKey = privateKey.replace(/\\n/g, "\n").replace(/\n/g, "\n").replace(/""/g, '"')
    }

    console.log("Private key format check:")
    console.log("- Contains BEGIN marker:", formattedPrivateKey.includes("-----BEGIN PRIVATE KEY-----"))
    console.log("- Contains END marker:", formattedPrivateKey.includes("-----END PRIVATE KEY-----"))
    console.log("- First 30 chars:", formattedPrivateKey.substring(0, 30))

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

    // Try to get spreadsheet info
    console.log("Fetching spreadsheet info...")
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    })

    // Try to create a test sheet if it doesn't exist
    console.log("Creating test sheet...")
    try {
      // Check if the test sheet exists
      const sheetExists = spreadsheetInfo.data.sheets?.some((sheet) => sheet.properties?.title === SHEET_NAME)

      if (!sheetExists) {
        // Create the test sheet
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
        console.log("Test sheet created successfully")
      } else {
        console.log("Test sheet already exists")
      }

      // Write test data to the sheet
      const testData = [
        ["ID", "Timestamp", "Test"],
        [`test-${Date.now()}`, new Date().toISOString(), "Test data"],
      ]

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:C2`,
        valueInputOption: "RAW",
        requestBody: {
          values: testData,
        },
      })

      console.log("Test data written successfully")

      return NextResponse.json({
        success: true,
        message: "Google Sheets connection successful",
        spreadsheetTitle: spreadsheetInfo.data.properties?.title,
        sheets: spreadsheetInfo.data.sheets?.map((sheet) => sheet.properties?.title),
      })
    } catch (sheetError) {
      console.error("Error creating or writing to test sheet:", sheetError)
      return NextResponse.json(
        {
          success: false,
          error: "Sheet operation failed",
          details: sheetError instanceof Error ? sheetError.message : "Unknown error",
          spreadsheetInfo: {
            title: spreadsheetInfo.data.properties?.title,
            sheets: spreadsheetInfo.data.sheets?.map((sheet) => sheet.properties?.title),
          },
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error testing Google Sheets connection:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Connection test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
