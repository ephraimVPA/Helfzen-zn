"use client"

import { MessageSquare } from "lucide-react"
import { useComments } from "@/contexts/comment-context"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function FeedbackToggle() {
  const { isCommentMode, toggleCommentMode, shortcutKeys, isAuthenticated, userInfo } = useComments()

  // Don't show the toggle if not authenticated
  if (!isAuthenticated) return null

  // If user doesn't have comment access, show a disabled button with tooltip
  if (!userInfo?.commentAccess) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg opacity-50"
              disabled
            >
              <MessageSquare className="h-6 w-6" />
              <span className="sr-only">Feedback Mode</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>You don't have permission to use the feedback feature</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isCommentMode ? "default" : "outline"}
            size="icon"
            onClick={toggleCommentMode}
            className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
          >
            <MessageSquare className="h-6 w-6" />
            <span className="sr-only">{isCommentMode ? "Disable" : "Enable"} Feedback Mode</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>
            {isCommentMode ? "Disable" : "Enable"} Feedback Mode ({shortcutKeys})
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
