import { google } from "googleapis"
import { JWT } from "google-auth-library"
import bcrypt from "bcryptjs"

// Define the structure of a user in the spreadsheet
export interface SheetUser {
  email: string
  password_hash: string
  name: string
  createdAt: string
  role: string
  commentAccess: string // "TRUE" or "FALSE"
}

// Initialize the Google Sheets client - EXACTLY the same as in google-sheets.ts
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

    console.log("Private key format check:")
    console.log("- Contains BEGIN marker:", privateKey.includes("-----BEGIN PRIVATE KEY-----"))
    console.log("- Contains END marker:", privateKey.includes("-----END PRIVATE KEY-----"))
    console.log("- First 30 chars:", privateKey.substring(0, 30))

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
    throw error
  }
}

// The ID of the Google Sheet - using the same spreadsheet ID as comments
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || "1oiQo_Sn7PwI3tl-3TKr1Z7SmT5KdWXFCfqcopQ1M1oM"
const SHEET_NAME = "Users"

// Get all users from the Google Sheet
export async function getUsersFromSheet(): Promise<SheetUser[]> {
  try {
    console.log("Fetching users from Google Sheet...")
    const sheets = await initializeSheets()

    console.log(`Using spreadsheet ID: ${SPREADSHEET_ID}`)
    console.log(`Looking for sheet: ${SHEET_NAME}`)

    // First, check if the sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    })

    const sheetExists = spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === SHEET_NAME)

    if (!sheetExists) {
      console.log(`Sheet "${SHEET_NAME}" does not exist, creating it...`)
      // Create the sheet with headers
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
        range: `${SHEET_NAME}!A1:F1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [["email", "password_hash", "name", "createdAt", "role", "commentAccess"]],
        },
      })
      console.log("Created sheet and added headers")
    } else {
      console.log(`Sheet "${SHEET_NAME}" exists`)
    }

    // Now fetch the data
    console.log(`Fetching data from ${SHEET_NAME}...`)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:F`,
    })

    const rows = response.data.values || []
    console.log(`Retrieved ${rows.length} users from Google Sheets`)

    // Log the raw data for debugging
    console.log("Raw user data from sheet:", JSON.stringify(rows))

    // Parse the rows into user objects
    const users = rows.map((row) => ({
      email: (row[0] || "").trim().toLowerCase(),
      password_hash: row[1] || "",
      name: row[2] || "",
      createdAt: row[3] || "",
      role: row[4] || "user",
      commentAccess: row[5] || "FALSE",
    }))

    // Log the parsed users for debugging
    console.log("Parsed users:", JSON.stringify(users))

    return users
  } catch (error) {
    console.error("Error fetching users from Google Sheet:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return []
  }
}

// Find a user by email
export async function findUserByEmail(email: string): Promise<SheetUser | null> {
  try {
    if (!email) {
      console.error("No email provided to findUserByEmail")
      return null
    }

    const normalizedEmail = email.toLowerCase().trim()
    console.log(`Looking for user with email: "${normalizedEmail}"`)

    const users = await getUsersFromSheet()
    console.log(`Searching through ${users.length} users`)

    // Log all emails for debugging
    const allEmails = users.map((u) => u.email)
    console.log("All emails in sheet:", JSON.stringify(allEmails))

    // Find the user with the matching email
    const user = users.find((u) => u.email === normalizedEmail)

    if (user) {
      console.log(`Found user: ${user.email}`)
      return user
    } else {
      console.log(`No user found with email "${normalizedEmail}"`)
      return null
    }
  } catch (error) {
    console.error("Error finding user by email:", error)
    return null
  }
}

// Check if a user is new (no password set)
export async function isNewUser(email: string): Promise<boolean> {
  try {
    const user = await findUserByEmail(email)

    if (!user) {
      console.log(`User with email ${email} not found in sheet`)
      return false
    }

    const isNew = !user.password_hash
    console.log(`User ${email} is new: ${isNew}`)
    return isNew
  } catch (error) {
    console.error("Error checking if user is new:", error)
    return false
  }
}

// Check if a user has comment access
export async function checkUserCommentAccess(email: string): Promise<boolean> {
  try {
    const user = await findUserByEmail(email)

    if (!user) {
      console.log(`User with email ${email} not found in sheet`)
      return false
    }

    const hasAccess = user.commentAccess.toUpperCase() === "TRUE"
    console.log(`User ${email} comment access: ${hasAccess}`)
    return hasAccess
  } catch (error) {
    console.error("Error checking comment access:", error)
    return false
  }
}

// Add a user to the sheet if they don't exist
export async function addUserIfNotExists(email: string, name: string): Promise<SheetUser | null> {
  try {
    // Check if user already exists
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return existingUser
    }

    console.log(`Adding new user ${email} to sheet`)
    const sheets = await initializeSheets()

    // Add the new user
    const now = new Date().toISOString()
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[email, "", name, now, "user", "FALSE"]],
      },
    })

    console.log(`Added user ${email} to sheet`)

    // Return the new user
    return {
      email,
      password_hash: "",
      name,
      createdAt: now,
      role: "user",
      commentAccess: "FALSE",
    }
  } catch (error) {
    console.error("Error adding user:", error)
    return null
  }
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    return hash
  } catch (error) {
    console.error("Error hashing password:", error)
    throw error
  }
}

// Verify a password
export async function verifyUserPassword(email: string, password: string): Promise<boolean> {
  try {
    const user = await findUserByEmail(email)

    if (!user) {
      console.log(`User with email ${email} not found in sheet`)
      return false
    }

    if (!user.password_hash) {
      console.log(`User ${email} has no password set`)
      return false
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    console.log(`Password for user ${email} is valid: ${isValid}`)
    return isValid
  } catch (error) {
    console.error("Error verifying password:", error)
    return false
  }
}

// Update a user's password hash
export async function updatePasswordHash(email: string, password: string): Promise<boolean> {
  try {
    const sheets = await initializeSheets()
    const hashedPassword = await hashPassword(password)

    // Get all users to find the row index
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    })

    const emails = response.data.values || []
    const rowIndex = emails.findIndex((row) => row[0] === email)

    if (rowIndex === -1) {
      console.error(`User with email ${email} not found`)
      return false
    }

    // Update the password hash
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!B${rowIndex + 2}`, // +2 because spreadsheet is 1-indexed and we have a header row
      valueInputOption: "RAW",
      requestBody: {
        values: [[hashedPassword]],
      },
    })

    console.log(`Password hash updated successfully for user ${email}`)
    return true
  } catch (error) {
    console.error("Error updating password hash:", error)
    return false
  }
}

// Debug spreadsheet ID
export async function debugSpreadsheetId(): Promise<void> {
  console.log(`Spreadsheet ID: ${SPREADSHEET_ID}`)
}

// Add the missing exports that are required by other parts of the application
export const updateUserPasswordHash = updatePasswordHash
export const verifyPassword = verifyUserPassword
