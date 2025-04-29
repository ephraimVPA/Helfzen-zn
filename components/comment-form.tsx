"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useComments } from "@/contexts/comment-context"
import { toast } from "sonner"

export function CommentForm() {
  const { showCommentForm, commentPosition, submitComment, closeCommentForm } = useComments()
  const [text, setText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (showCommentForm && textareaRef.current) {
      setText("")
      // Focus the textarea when the form appears
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }, [showCommentForm])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        closeCommentForm()
      }
    }

    if (showCommentForm) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showCommentForm, closeCommentForm])

  // Debug log to check if the form should be shown
  useEffect(() => {
    console.log("CommentForm showCommentForm:", showCommentForm)
    console.log("CommentForm position:", commentPosition)
  }, [showCommentForm, commentPosition])

  if (!showCommentForm) return null

  // Calculate position to ensure form stays within viewport
  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 0
  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 0

  const formWidth = 300
  const formHeight = 250

  let left = commentPosition.x
  let top = commentPosition.y

  if (left + formWidth > windowWidth) {
    left = windowWidth - formWidth - 10
  }

  if (top + formHeight > windowHeight) {
    top = windowHeight - formHeight - 10
  }

  // Ensure left and top are never negative
  left = Math.max(10, left)
  top = Math.max(10, top)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isSubmitting) return

    setIsSubmitting(true)

    // Show loading toast
    const toastId = "comment-submit"
    toast.loading("Submitting feedback...", { id: toastId })

    try {
      console.log("Submitting comment...")
      const success = await submitComment(text)

      if (success) {
        toast.success("Feedback submitted successfully", { id: toastId })
        setText("")
        closeCommentForm()
      } else {
        toast.error("Failed to submit feedback. Please try again.", { id: toastId })
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      toast.error("Failed to submit feedback: " + (error instanceof Error ? error.message : "Unknown error"), {
        id: toastId,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      ref={formRef}
      className="fixed z-[9999] w-[300px] shadow-lg"
      style={{ left: `${left}px`, top: `${top}px` }}
      data-testid="comment-form"
    >
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Add Feedback</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={closeCommentForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Textarea
              ref={textareaRef}
              placeholder="What feedback would you like to share about this area?"
              className="min-h-[100px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-between py-2">
            <Button variant="ghost" type="button" onClick={closeCommentForm} size="sm">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!text.trim() || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
