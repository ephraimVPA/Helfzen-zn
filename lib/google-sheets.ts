import { google } from "googleapis"
import { JWT } from "google-auth-library"

// Define the structure of a comment in the spreadsheet
export interface CommentRow {
  id: string
  elementId: string
  text: string
  innerHTML: string // Added innerHTML column
  path: string
  userId: string
  userName: string
  createdAt: string
  position: string
  element?: string // Optional HTML context
}

// Initialize the Google Sheets client
const initializeSheets = async () => {
  try {
    // Get credentials from environment variables
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY

    if (!clientEmail || !privateKey) {
      console.error("Missing Google Sheets credentials in environment variables")
      console.error("GOOGLE_CLIENT_EMAIL exists:", !!clientEmail)
      console.error("GOOGLE_PRIVATE_KEY exists:", !!privateKey)
      throw new Error("Missing Google Sheets credentials")
    }

    // Fix private key formatting - this is critical for JWT authentication
    // The private key from environment variables often has escaped newlines
    const formattedPrivateKey = privateKey.includes("-----BEGIN PRIVATE KEY-----")
      ? privateKey
      : privateKey.replace(/\\n/g, "\n").replace(/\n/g, "\n").replace(/""/g, '"')

    // Also add more detailed logging:
    console.log("Private key format check:")
    console.log("- Contains BEGIN marker:", privateKey.includes("-----BEGIN PRIVATE KEY-----"))
    console.log("- Contains END marker:", privateKey.includes("-----END PRIVATE KEY-----"))
    console.log("- First 30 chars:", privateKey.substring(0, 30))

    // Log the first and last few characters of the private key for debugging
    const privateKeyLength = privateKey.length
    const formattedKeyLength = formattedPrivateKey.length
    console.log("Original private key length:", privateKeyLength)
    console.log("Formatted private key length:", formattedKeyLength)
    console.log("Private key starts with:", privateKey.substring(0, 20))
    console.log("Private key ends with:", privateKey.substring(privateKeyLength - 20))
    console.log("Formatted key starts with:", formattedPrivateKey.substring(0, 20))
    console.log("Formatted key ends with:", formattedPrivateKey.substring(formattedKeyLength - 20))

    console.log("Initializing Google Sheets client with email:", clientEmail)

    const client = new JWT({
      email: clientEmail,
      key: formattedPrivateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    // Test the authentication explicitly
    try {
      console.log("Attempting to authorize with Google...")
      await client.authorize()
      console.log("Google authentication successful")
    } catch (authError) {
      console.error("Google authentication failed:", authError)
      if (authError instanceof Error) {
        console.error("Auth error message:", authError.message)
        console.error("Auth error stack:", authError.stack)
      }
      throw new Error(
        `Google authentication failed: ${authError instanceof Error ? authError.message : "Unknown error"}`,
      )
    }

    const sheets = google.sheets({ version: "v4", auth: client })
    return sheets
  } catch (error) {
    console.error("Failed to initialize Google Sheets client:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    throw error // Re-throw to handle in the calling function
  }
}

// The ID of the Google Sheet - make sure this is correct and accessible
// This is a public spreadsheet for testing - replace with your actual spreadsheet ID
const SPREADSHEET_ID = "1oiQo_Sn7PwI3tl-3TKr1Z7SmT5KdWXFCfqcopQ1M1oM"
const SHEET_NAME = "Comments"

// Get all comments from the Google Sheet
export async function getCommentsFromSheet(): Promise<CommentRow[]> {
  try {
    console.log("Initializing Google Sheets client for fetching comments...")
    const sheets = await initializeSheets()

    console.log("Ensuring sheet exists...")
    // Create the sheet if it doesn't exist
    await ensureSheetExists(sheets)

    console.log("Fetching comments from sheet:", SPREADSHEET_ID, SHEET_NAME)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:J`, // Include the element column
    })

    const rows = response.data.values || []
    console.log(`Retrieved ${rows.length} comments from Google Sheets`)

    return rows.map((row) => ({
      id: row[0] || "",
      elementId: row[1] || "",
      text: row[2] || "",
      innerHTML: row[3] || "",
      path: row[4] || "",
      userId: row[5] || "",
      userName: row[6] || "",
      createdAt: row[7] || "",
      position: row[8] || '{"x":0,"y":0}',
      element: row[9] || "",
    }))
  } catch (error) {
    console.error("Error fetching comments from Google Sheet:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return []
  }
}

// Ensure the sheet exists and has the correct headers
async function ensureSheetExists(sheets: any) {
  try {
    console.log("Checking if sheet exists:", SPREADSHEET_ID, SHEET_NAME)
    // Check if the sheet exists
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    })

    const sheetExists = response.data.sheets.some((sheet: any) => sheet.properties.title === SHEET_NAME)

    if (!sheetExists) {
      console.log("Sheet doesn't exist, creating it...")
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

      console.log("Adding headers to the sheet...")
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:J1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [
            ["ID", "ElementID", "Text", "InnerHTML", "Path", "UserID", "UserName", "CreatedAt", "Position", "Element"],
          ],
        },
      })
      console.log("Sheet created and headers added successfully")
    } else {
      console.log("Sheet already exists")
    }
  } catch (error) {
    console.error("Error ensuring sheet exists:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    throw error
  }
}

// Add a new comment to the Google Sheet
export async function addCommentToSheet(comment: CommentRow): Promise<boolean> {
  try {
    console.log("Adding comment to Google Sheet:", comment.id)

    // Validate comment data
    if (!comment.id || !comment.elementId || !comment.text) {
      console.error("Invalid comment data:", comment)
      throw new Error("Invalid comment data: missing required fields")
    }

    const sheets = await initializeSheets()

    // Ensure the sheet exists
    await ensureSheetExists(sheets)

    // Clean the text to avoid issues with special characters
    const cleanText = comment.text.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "")

    console.log("Appending values to sheet:", SPREADSHEET_ID, SHEET_NAME)
    console.log("Comment data:", {
      id: comment.id,
      elementId: comment.elementId,
      text: cleanText.substring(0, 20) + (cleanText.length > 20 ? "..." : ""),
      path: comment.path,
      createdAt: comment.createdAt,
    })

    // Prepare the row data
    const rowData = [
      comment.id,
      comment.elementId,
      cleanText,
      comment.innerHTML,
      comment.path,
      comment.userId,
      comment.userName,
      comment.createdAt,
      comment.position,
      comment.element || "",
    ]

    // Validate that all required fields are present
    if (!rowData[0] || !rowData[1] || !rowData[2]) {
      throw new Error(
        `Missing required fields in comment: ${JSON.stringify({
          id: rowData[0],
          elementId: rowData[1],
          text: rowData[2],
        })}`,
      )
    }

    // Append the row to the sheet
    console.log("Sending request to Google Sheets API...")
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:J`, // Include the element column
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rowData],
      },
    })

    console.log("Google Sheets API response:", response.status, response.statusText)
    console.log("Response data:", JSON.stringify(response.data).substring(0, 200) + "...")

    if (response.status !== 200) {
      throw new Error(`Google Sheets API returned status ${response.status}: ${response.statusText}`)
    }

    console.log("Comment added successfully to Google Sheet")
    return true
  } catch (error) {
    console.error("Error adding comment to Google Sheet:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    throw error // Re-throw to handle in the calling function
  }
}

// Delete a comment from the Google Sheet
export async function deleteCommentFromSheet(commentId: string): Promise<boolean> {
  try {
    console.log("Deleting comment from Google Sheet:", commentId)
    const sheets = await initializeSheets()

    // First, get all comments to find the row index
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    })

    const ids = response.data.values || []
    const rowIndex = ids.findIndex((row) => row[0] === commentId)

    if (rowIndex === -1) {
      console.error(`Comment with ID ${commentId} not found`)
      return false
    }

    console.log(`Found comment at row index ${rowIndex}`)

    // Get the sheet ID
    const sheetsResponse = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    })

    const sheet = sheetsResponse.data.sheets.find((s: any) => s.properties.title === SHEET_NAME)

    if (!sheet) {
      console.error(`Sheet ${SHEET_NAME} not found`)
      return false
    }

    const sheetId = sheet.properties.sheetId

    // Delete the row (add 2 because spreadsheet is 1-indexed and we have a header row)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: rowIndex + 1, // +1 for header row
                endIndex: rowIndex + 2, // +1 for inclusive range
              },
            },
          },
        ],
      },
    })

    console.log("Comment deleted successfully from Google Sheet")
    return true
  } catch (error) {
    console.error("Error deleting comment from Google Sheet:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return false
  }
}
