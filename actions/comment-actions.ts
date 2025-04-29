"use server"

import { getCommentsFromSheet, addCommentToSheet, deleteCommentFromSheet, type CommentRow } from "@/lib/google-sheets"
import { auth } from "@/lib/auth"
import { nanoid } from "nanoid"

export type Position = {
  x: number
  y: number
  xPercent?: number // Added for relative positioning
  yPercent?: number // Added for relative positioning
}

export type Comment = {
  id: string
  elementId: string
  text: string
  innerHTML?: string // Added innerHTML field
  position: Position
  path: string
  createdAt: Date
  userId: string
  userName: string
  element?: string // HTML content for context
}

// Get all comments
export async function getComments(): Promise<Comment[]> {
  try {
    console.log("Server: Fetching comments from Google Sheets")
    const commentRows = await getCommentsFromSheet()
    console.log(`Server: Retrieved ${commentRows.length} comments`)

    return commentRows.map((row) => {
      // Default position if parsing fails
      let position: Position = { x: 0, y: 0 }

      try {
        // Check if position is a valid JSON string
        if (
          row.position &&
          typeof row.position === "string" &&
          (row.position.startsWith("{") || row.position.startsWith("["))
        ) {
          position = JSON.parse(row.position) as Position
        } else {
          console.warn(`Invalid position format for comment ${row.id}, using default position`)
        }
      } catch (e) {
        console.error(`Error parsing position JSON for comment ${row.id}:`, e)
        // Keep using the default position
      }

      // Validate and parse date
      let createdAt: Date
      try {
        createdAt = row.createdAt ? new Date(row.createdAt) : new Date()
        // Check if date is valid
        if (isNaN(createdAt.getTime())) {
          console.warn(`Invalid date for comment ${row.id}, using current date`)
          createdAt = new Date()
        }
      } catch (e) {
        console.error(`Error parsing date for comment ${row.id}:`, e)
        createdAt = new Date()
      }

      return {
        id: row.id || nanoid(),
        elementId: row.elementId || "",
        text: row.text || "",
        innerHTML: row.innerHTML || "",
        position: position,
        path: row.path || "",
        createdAt: createdAt,
        userId: row.userId || "",
        userName: row.userName || "Anonymous",
        element: row.element || "",
      }
    })
  } catch (error) {
    console.error("Server: Error getting comments:", error)
    return []
  }
}

// Save a new comment
export async function saveComment(comment: Omit<Comment, "userId" | "userName">): Promise<Comment | null> {
  console.log("Server: Starting saveComment function with data:", {
    id: comment.id,
    elementId: comment.elementId,
    textLength: comment.text?.length || 0,
    path: comment.path,
  })

  try {
    // Validate input
    if (!comment.text || !comment.text.trim()) {
      console.error("Server: Missing comment text")
      throw new Error("Comment text is required")
    }

    if (!comment.elementId) {
      console.error("Server: Missing element ID")
      throw new Error("Element ID is required")
    }

    console.log("Server: Saving comment to Google Sheets", {
      id: comment.id,
      elementId: comment.elementId,
      text: comment.text?.substring(0, 20) + "...",
      path: comment.path,
    })

    try {
      // Get the current user
      console.log("Server: Getting user session")
      const session = await auth()

      if (!session?.user) {
        console.error("Server: User not authenticated")
        throw new Error("User not authenticated")
      }

      console.log("Server: User authenticated:", session.user.name)
      const userId = session.user.id || "anonymous"
      const userName = session.user.name || "Anonymous"

      // Generate a unique ID if not provided
      const id = comment.id || nanoid()

      const newComment: Comment = {
        ...comment,
        id,
        userId,
        userName,
      }

      // Get the HTML context of the element for better reference
      let elementContext = ""
      if (comment.element) {
        // Limit the size of the element HTML to avoid issues
        elementContext = comment.element.substring(0, 500)
      }

      console.log("Server: Creating comment row for Google Sheets")
      const commentRow: CommentRow = {
        id: newComment.id,
        elementId: newComment.elementId,
        text: newComment.text,
        innerHTML: newComment.innerHTML || "", // Add innerHTML field
        path: newComment.path,
        userId: newComment.userId,
        userName: newComment.userName,
        createdAt: newComment.createdAt.toISOString(),
        position: JSON.stringify(newComment.position),
        element: elementContext,
      }

      console.log("Server: Adding comment to Google Sheets")
      try {
        const success = await addCommentToSheet(commentRow)
        if (success) {
          console.log("Server: Comment saved successfully")
          return newComment
        } else {
          console.error("Server: Failed to save comment to Google Sheets")
          throw new Error("Failed to save comment to Google Sheets")
        }
      } catch (sheetError) {
        console.error("Server: Error saving to Google Sheets:", sheetError)
        throw new Error(
          `Failed to save comment to Google Sheets: ${sheetError instanceof Error ? sheetError.message : "Unknown error"}`,
        )
      }
    } catch (authError) {
      console.error("Server: Authentication error:", authError)
      throw new Error(`Authentication failed: ${authError instanceof Error ? authError.message : "Unknown error"}`)
    }
  } catch (error) {
    console.error("Server: Error saving comment:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return null
  }
}

// Delete a comment
export async function deleteComment(id: string): Promise<boolean> {
  try {
    console.log("Server: Deleting comment", id)

    // Get the current user
    const session = await auth()

    if (!session?.user) {
      console.error("Server: User not authenticated")
      throw new Error("User not authenticated")
    }

    // Optional: Check if the user is an admin or the comment owner before deleting
    const success = await deleteCommentFromSheet(id)

    if (success) {
      console.log("Server: Comment deleted successfully")
    } else {
      console.error("Server: Failed to delete comment from Google Sheets")
    }

    return success
  } catch (error) {
    console.error("Server: Error deleting comment:", error)
    return false
  }
}
