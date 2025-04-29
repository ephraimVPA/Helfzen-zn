"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { nanoid } from "nanoid"

interface SimpleCommentFormProps {
  onSuccess?: () => void
}

export function SimpleCommentForm({ onSuccess }: SimpleCommentFormProps) {
  const [text, setText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Generate a unique element ID for testing
      const elementId = `test-element-${nanoid(6)}`

      // Create the comment data
      const commentData = {
        id: nanoid(),
        elementId,
        text,
        position: { x: 100, y: 100 },
        path: window.location.pathname,
        createdAt: new Date(),
      }

      // Call the test API endpoint
      const response = await fetch("/api/test-sheets/add-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Comment submitted successfully")
        setText("")
        if (onSuccess) onSuccess()
      } else {
        setError(result.error || "Failed to submit comment")
        toast.error(result.error || "Failed to submit comment")
      }
    } catch (err) {
      console.error("Error submitting comment:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)
      toast.error(`Failed to submit comment: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Submit Feedback</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            placeholder="What feedback would you like to share?"
            className="min-h-[100px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {error && <div className="mt-2 text-sm text-destructive">{error}</div>}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={!text.trim() || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
