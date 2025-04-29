"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { X } from "lucide-react"

import { useComments } from "@/contexts/comment-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"

export function CommentIndicator() {
  const { isCommentMode, commentsByElement, viewComment, activeCommentElementId } = useComments()
  const isMobile = useIsMobile()

  const [indicators, setIndicators] = useState<
    Array<{
      elementId: string
      count: number
      element: HTMLElement | null
      rect: DOMRect | null
      position: { top: number; left: number }
      elementContent: string | null
    }>
  >([])

  const observerRef = useRef<MutationObserver | null>(null)
  const updateTimersRef = useRef<NodeJS.Timeout[]>([])
  const lastUpdateRef = useRef<number>(0)
  const updateCountRef = useRef<number>(0)

  // Function to ensure position is within viewport
  const ensurePositionInViewport = useCallback((position: { top: number; left: number }) => {
    const padding = 20 // Padding from edges
    const indicatorSize = 28 // Size of the indicator

    // Get current viewport dimensions
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Calculate safe boundaries
    const maxLeft = viewportWidth - indicatorSize - padding
    const maxTop = viewportHeight - indicatorSize - padding

    // Ensure position is within viewport
    return {
      top: Math.max(padding, Math.min(position.top, maxTop + window.scrollY)),
      left: Math.max(padding, Math.min(position.left, maxLeft + window.scrollX)),
    }
  }, [])

  // Extract element content for display
  const getElementContent = useCallback(
    (elementId: string, element: HTMLElement | null) => {
      try {
        // First try to get content from the innerHTML field
        const comments = commentsByElement[elementId] || []
        if (comments.length > 0 && comments[0].innerHTML) {
          // Use the innerHTML field directly
          const tempDiv = document.createElement("div")
          tempDiv.innerHTML = comments[0].innerHTML
          const textContent = tempDiv.textContent?.trim()
          if (textContent && textContent.length > 0) {
            return textContent.length > 50 ? textContent.substring(0, 50) + "..." : textContent
          }
        }

        // Fall back to element field if innerHTML is not available
        if (comments.length > 0 && comments[0].element) {
          const tempDiv = document.createElement("div")
          tempDiv.innerHTML = comments[0].element

          // Try to get text content or a title attribute
          const textContent = tempDiv.textContent?.trim()
          const titleAttr = tempDiv.getAttribute("title") || tempDiv.getAttribute("aria-label")

          if (titleAttr) return titleAttr
          if (textContent && textContent.length > 0) {
            return textContent.length > 50 ? textContent.substring(0, 50) + "..." : textContent
          }
        }

        // If no content from comments, try to get from the actual element
        if (element) {
          const textContent = element.textContent?.trim()
          const titleAttr = element.getAttribute("title") || element.getAttribute("aria-label")

          if (titleAttr) return titleAttr
          if (textContent && textContent.length > 0) {
            return textContent.length > 50 ? textContent.substring(0, 50) + "..." : textContent
          }
        }
      } catch (error) {
        console.error(`Error getting element content for ${elementId}:`, error)
      }

      return `Element: ${elementId}`
    },
    [commentsByElement],
  )

  // Function to find elements with comments
  const findElementsWithComments = useCallback(() => {
    // Don't update if not in comment mode
    if (!isCommentMode) return

    console.log("Finding elements with comments...")

    const updateId = ++updateCountRef.current
    const newIndicators: Array<{
      elementId: string
      count: number
      element: HTMLElement | null
      rect: DOMRect | null
      position: { top: number; left: number }
      elementContent: string | null
    }> = []

    Object.entries(commentsByElement).forEach(([elementId, comments]) => {
      try {
        // First try to find the element by ID
        const element = document.getElementById(elementId)
        const rect = element?.getBoundingClientRect() || null
        let position = { top: 0, left: 0 }
        let elementContent = null

        // If element exists, use its position
        if (element && rect) {
          position = {
            top: window.scrollY + rect.top - 10,
            left: window.scrollX + rect.right - 10,
          }
          elementContent = getElementContent(elementId, element)
        } else {
          console.log(`Element not found for ID: ${elementId}`)

          // For missing elements, use stored position from the comment if available
          const firstComment = comments[0]
          if (firstComment && firstComment.position) {
            // Try to use the original position
            position = {
              top: firstComment.position.y,
              left: firstComment.position.x,
            }

            // If the position is outside the viewport, adjust it
            if (
              position.left < 0 ||
              position.left > window.innerWidth + window.scrollX ||
              position.top < 0 ||
              position.top > window.innerHeight + window.scrollY
            ) {
              // Use a position relative to the viewport size
              position = {
                top: window.scrollY + Math.min(firstComment.position.y, window.innerHeight * 0.8),
                left: window.scrollX + Math.min(firstComment.position.x, window.innerWidth * 0.8),
              }
            }
          } else {
            // Default position in top-right corner
            position = {
              top: window.scrollY + 100,
              left: window.scrollX + window.innerWidth - 100,
            }
          }

          // Get element content from stored HTML
          elementContent = getElementContent(elementId, null)
        }

        // Ensure position is within viewport
        position = ensurePositionInViewport(position)

        newIndicators.push({
          elementId,
          count: comments.length,
          element,
          rect,
          position,
          elementContent,
        })
      } catch (error) {
        console.error(`Error finding element ${elementId}:`, error)

        // Add a fallback indicator even if there's an error
        const fallbackPosition = ensurePositionInViewport({
          top: window.scrollY + 100,
          left: window.scrollX + window.innerWidth - 100,
        })

        newIndicators.push({
          elementId,
          count: comments.length,
          element: null,
          rect: null,
          position: fallbackPosition,
          elementContent: getElementContent(elementId, null),
        })
      }
    })

    console.log(`Found ${newIndicators.length} indicators for comments (update #${updateId})`)
    setIndicators(newIndicators)
  }, [isCommentMode, commentsByElement, ensurePositionInViewport, getElementContent])

  // Schedule multiple updates to ensure all elements are found
  const scheduleMultipleUpdates = useCallback(() => {
    // Clear any existing update timers
    updateTimersRef.current.forEach((timer) => clearTimeout(timer))
    updateTimersRef.current = []

    // Schedule multiple updates with increasing delays
    const delays = [0, 100, 300, 500, 1000, 2000, 3000, 5000]

    delays.forEach((delay) => {
      const timer = setTimeout(() => {
        if (isCommentMode) {
          console.log(`Scheduled update after ${delay}ms`)
          findElementsWithComments()
        }
      }, delay)

      updateTimersRef.current.push(timer)
    })
  }, [findElementsWithComments, isCommentMode])

  // Set up observers and event listeners when comment mode changes
  useEffect(() => {
    if (!isCommentMode) {
      // Clear indicators when comment mode is disabled
      setIndicators([])

      // Clear any existing update timers
      updateTimersRef.current.forEach((timer) => clearTimeout(timer))
      updateTimersRef.current = []

      // Disconnect observer if it exists
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      return
    }

    console.log("Comment mode enabled, setting up observers and scheduling updates")

    // Schedule multiple updates immediately when comment mode is enabled
    scheduleMultipleUpdates()

    // Set up mutation observer for DOM changes
    const observer = new MutationObserver(() => {
      scheduleMultipleUpdates()
    })

    observerRef.current = observer

    // Observe the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "id"],
    })

    // Add scroll and resize listeners
    const handleViewportChange = () => {
      scheduleMultipleUpdates()
    }

    window.addEventListener("scroll", handleViewportChange, { passive: true })
    window.addEventListener("resize", handleViewportChange, { passive: true })

    return () => {
      // Clean up
      updateTimersRef.current.forEach((timer) => clearTimeout(timer))
      updateTimersRef.current = []

      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      window.removeEventListener("scroll", handleViewportChange)
      window.removeEventListener("resize", handleViewportChange)
    }
  }, [isCommentMode, scheduleMultipleUpdates])

  // Update indicators when comments change
  useEffect(() => {
    if (isCommentMode && Object.keys(commentsByElement).length > 0) {
      console.log(`Comments updated with ${Object.keys(commentsByElement).length} elements, scheduling updates`)
      scheduleMultipleUpdates()
    }
  }, [isCommentMode, commentsByElement, scheduleMultipleUpdates])

  if (!isCommentMode) {
    return null
  }

  // Helper function to safely format dates
  const safeFormatDate = (date: Date) => {
    try {
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Unknown date"
      }
      return date.toLocaleDateString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Unknown date"
    }
  }

  return (
    <>
      {indicators.map(({ elementId, count, position, elementContent }) => {
        return (
          <div key={elementId}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`absolute z-50 flex items-center justify-center rounded-full shadow-md transition-all ${
                      activeCommentElementId === elementId
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                    }`}
                    style={{
                      width: count > 1 ? "28px" : "24px",
                      height: count > 1 ? "28px" : "24px",
                      top: `${position.top}px`,
                      left: `${position.left}px`,
                      fontSize: count > 1 ? "14px" : "12px",
                      fontWeight: "bold",
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      viewComment(elementId)
                    }}
                  >
                    {count}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {elementContent
                    ? `${elementContent} (${count} ${count === 1 ? "comment" : "comments"})`
                    : `${count} ${count === 1 ? "comment" : "comments"}`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Comment display when active */}
            {activeCommentElementId === elementId && (
              <Card
                className={`absolute z-50 shadow-lg ${isMobile ? "w-[calc(100%-32px)]" : "w-80"}`}
                style={{
                  top: isMobile ? `${position.top + 30}px` : `${position.top + 30}px`,
                  left: isMobile
                    ? "16px" // Center on mobile
                    : `${Math.min(position.left, window.innerWidth - 340 + window.scrollX)}px`,
                  maxWidth: isMobile ? "calc(100% - 32px)" : "320px",
                }}
              >
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <CardTitle className="text-sm pr-6">
                    {elementContent ? (
                      <div className="text-sm font-medium truncate" title={elementContent}>
                        {elementContent}
                      </div>
                    ) : (
                      `Comments (${commentsByElement[elementId]?.length || 0})`
                    )}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mt-1 -mr-2"
                    onClick={() => viewComment(elementId)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-60 pr-4">
                    <div className="space-y-4">
                      {commentsByElement[elementId]?.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{comment.userName?.substring(0, 2) || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{comment.userName || "Anonymous"}</span>
                              <span className="text-xs text-muted-foreground">{safeFormatDate(comment.createdAt)}</span>
                            </div>
                            <p className="text-sm">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        )
      })}
    </>
  )
}
