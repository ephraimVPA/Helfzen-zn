"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { nanoid } from "nanoid"
import { toast } from "sonner"

import { saveComment, getComments, type Comment, type Position } from "@/actions/comment-actions"

type CommentContextType = {
  isCommentMode: boolean
  toggleCommentMode: () => void
  showCommentForm: boolean
  commentPosition: Position
  handleContextMenu: (e: React.MouseEvent) => void
  submitComment: (text: string) => Promise<boolean>
  closeCommentForm: () => void
  comments: Comment[]
  commentsByElement: Record<string, Comment[]>
  viewComment: (elementId: string) => void
  activeCommentElementId: string | null
  shortcutKeys: string
  isAuthenticated: boolean
  userInfo: { name: string; email: string; commentAccess?: boolean } | null
}

// Change the keyboard shortcut to Ctrl+Alt+C
const SHORTCUT_KEYS = "Ctrl+Alt+C"

const CommentContext = createContext<CommentContextType | undefined>(undefined)

export function CommentProvider({ children }: { children: React.ReactNode }) {
  const [isCommentMode, setIsCommentMode] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [commentPosition, setCommentPosition] = useState<Position>({ x: 0, y: 0 })
  const [comments, setComments] = useState<Comment[]>([])
  const [targetElementId, setTargetElementId] = useState<string>("")
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [activeCommentElementId, setActiveCommentElementId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; commentAccess?: boolean } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Use a ref to track if comments have been loaded for the current path
  const commentsLoadedRef = useRef(false)
  const loadTimersRef = useRef<NodeJS.Timeout[]>([])

  // Check for comment mode in URL parameters and enforce access control
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const commentMode = urlParams.get("commentMode")

      if (commentMode === "true") {
        // Only enable comment mode if the user is authenticated and has access
        if (isAuthenticated && userInfo?.commentAccess) {
          setIsCommentMode(true)
          // Show toast with instructions when comment mode is enabled via URL
          setTimeout(() => {
            toast.info("Feedback mode enabled. Right-click on any element to leave feedback.")
          }, 500)
        } else {
          // Remove the commentMode parameter if the user doesn't have access
          const url = new URL(window.location.href)
          url.searchParams.delete("commentMode")
          window.history.replaceState({}, "", url.toString())

          // Show a toast message if the user is authenticated but doesn't have access
          if (isAuthenticated && !userInfo?.commentAccess) {
            toast.error("You don't have permission to use the feedback feature")
          }
        }
      }
    }
  }, [isAuthenticated, userInfo])

  // Group comments by element ID, but only for the current path
  const commentsByElement = comments.reduce(
    (acc, comment) => {
      // Skip comments that don't belong to the current path
      if (!comment.elementId || comment.path !== pathname) return acc

      if (!acc[comment.elementId]) {
        acc[comment.elementId] = []
      }

      acc[comment.elementId].push(comment)
      return acc
    },
    {} as Record<string, Comment[]>,
  )

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...")
        const response = await fetch("/api/auth/check", {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log("Auth check successful:", data.user)
          setIsAuthenticated(true)
          setUserInfo(data.user)

          // If comment mode is enabled but user doesn't have access, disable it
          if (isCommentMode && !data.user.commentAccess) {
            setIsCommentMode(false)
            toast.error("You don't have permission to use the feedback feature")

            // Remove the commentMode parameter from the URL
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href)
              url.searchParams.delete("commentMode")
              window.history.replaceState({}, "", url.toString())
            }
          }
        } else {
          console.log("Auth check failed, not authenticated")
          setIsAuthenticated(false)
          setUserInfo(null)

          // If not authenticated, disable comment mode
          if (isCommentMode) {
            setIsCommentMode(false)

            // Remove the commentMode parameter from the URL
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href)
              url.searchParams.delete("commentMode")
              window.history.replaceState({}, "", url.toString())
            }
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
        setIsAuthenticated(false)
        setUserInfo(null)
      } finally {
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [pathname, isCommentMode])

  // Load comments function with multiple retries
  const loadComments = useCallback(async () => {
    // Clear any existing load timers
    loadTimersRef.current.forEach((timer) => clearTimeout(timer))
    loadTimersRef.current = []

    // Set loading state
    setIsLoading(true)
    commentsLoadedRef.current = false

    console.log("Loading comments for path:", pathname)

    try {
      const allComments = await getComments()
      console.log(`Loaded ${allComments.length} comments`)

      // Filter out any invalid comments
      const validComments = allComments.filter((comment) => comment && comment.id && comment.elementId && comment.text)

      setComments(validComments || [])
      commentsLoadedRef.current = true

      console.log(`Set ${validComments.length} valid comments`)
    } catch (error) {
      console.error("Failed to load comments:", error)
      toast.error("Failed to load comments")
    } finally {
      setIsLoading(false)
    }
  }, [pathname])

  // Schedule multiple comment loads with increasing delays
  const scheduleMultipleLoads = useCallback(() => {
    // Clear any existing load timers
    loadTimersRef.current.forEach((timer) => clearTimeout(timer))
    loadTimersRef.current = []

    // Schedule multiple loads with increasing delays
    const delays = [0, 500, 1500]

    delays.forEach((delay) => {
      const timer = setTimeout(() => {
        if (!commentsLoadedRef.current) {
          console.log(`Scheduled comment load after ${delay}ms`)
          loadComments()
        }
      }, delay)

      loadTimersRef.current.push(timer)
    })
  }, [loadComments])

  // Load comments when pathname changes
  useEffect(() => {
    console.log("Path changed, scheduling comment loads")
    commentsLoadedRef.current = false
    scheduleMultipleLoads()

    // Reset active comment when path changes
    setActiveCommentElementId(null)

    return () => {
      // Clean up timers when unmounting or path changes
      loadTimersRef.current.forEach((timer) => clearTimeout(timer))
      loadTimersRef.current = []
    }
  }, [pathname, scheduleMultipleLoads])

  // Add this effect to update the body data attribute when comment mode changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isCommentMode) {
        document.body.setAttribute("data-comment-mode", "true")
      } else {
        document.body.removeAttribute("data-comment-mode")
      }
    }
  }, [isCommentMode])

  const toggleCommentMode = useCallback(() => {
    // Toggle comment mode
    setIsCommentMode((prev) => {
      const newState = !prev

      if (typeof window !== "undefined") {
        // Update URL with comment mode parameter
        const url = new URL(window.location.href)
        if (newState) {
          // Only enable comment mode if the user is authenticated
          if (!isAuthenticated) {
            console.log("Not authenticated, redirecting to login")
            toast.info("Please log in to use the feedback feature")
            router.push(`/login?callbackUrl=${encodeURIComponent(pathname + "?commentMode=true")}`)
            return prev // Don't change state yet
          }

          // Check if user has comment access
          if (!userInfo?.commentAccess) {
            console.log("User does not have comment access")
            toast.error("You don't have permission to use the feedback feature")
            return prev // Don't change state
          }

          url.searchParams.set("commentMode", "true")

          // Show toast with instructions when comment mode is enabled
          toast.info("Feedback mode enabled. Right-click on any element to leave feedback.", {
            duration: 5000,
          })

          // Force reload comments when enabling comment mode
          scheduleMultipleLoads()
        } else {
          url.searchParams.delete("commentMode")
          toast.info("Feedback mode disabled")
          // Close any open comment forms or views
          setShowCommentForm(false)
          setActiveCommentElementId(null)
        }

        // Update URL without full page reload
        window.history.replaceState({}, "", url.toString())
      }

      return newState
    })
  }, [isAuthenticated, pathname, router, scheduleMultipleLoads, userInfo])

  // Function to ensure an element has an ID
  const ensureElementId = (element: HTMLElement): string => {
    if (element.id) {
      return element.id
    }

    // Generate a unique ID
    const newId = `comment-target-${nanoid(6)}`
    element.id = newId
    return newId
  }

  // Add a global context menu handler to capture right-clicks
  useEffect(() => {
    if (!isCommentMode) return

    const handleGlobalContextMenu = (e: MouseEvent) => {
      if (!isCommentMode) return

      // Prevent default context menu
      e.preventDefault()
      e.stopPropagation()

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login")
        toast.error("Please log in to use the feedback feature")
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname + "?commentMode=true")}`)
        return
      }

      // Check if user has comment access
      if (!userInfo?.commentAccess) {
        console.log("User does not have comment access")
        toast.error("You don't have permission to use the feedback feature")
        return
      }

      // Get the target element
      const target = e.target as HTMLElement
      if (!target) return

      const elementId = ensureElementId(target)
      console.log("Context menu on element:", elementId)

      setTargetElementId(elementId)
      setTargetElement(target)

      // Store position
      const position = {
        x: e.clientX,
        y: e.clientY,
      }

      setCommentPosition(position)

      // Make sure to enable the comment form
      setShowCommentForm(true)
      console.log("Comment form should be displayed at:", position)
    }

    // Add global context menu listener when in comment mode
    if (isCommentMode) {
      document.addEventListener("contextmenu", handleGlobalContextMenu)
    }

    return () => {
      document.removeEventListener("contextmenu", handleGlobalContextMenu)
    }
  }, [isCommentMode, isAuthenticated, pathname, router, userInfo])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!isCommentMode) return

      // Only prevent default if in comment mode
      e.preventDefault()
      e.stopPropagation()

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login")
        toast.error("Please log in to use the feedback feature")
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname + "?commentMode=true")}`)
        return
      }

      // Check if user has comment access
      if (!userInfo?.commentAccess) {
        console.log("User does not have comment access")
        toast.error("You don't have permission to use the feedback feature")
        return
      }

      // Get the target element
      const target = e.target as HTMLElement
      if (!target) return

      const elementId = ensureElementId(target)
      console.log("Context menu on element:", elementId)

      setTargetElementId(elementId)
      setTargetElement(target)

      // Store position
      const position = {
        x: e.clientX,
        y: e.clientY,
      }

      setCommentPosition(position)

      // Make sure to enable the comment form
      setShowCommentForm(true)
      console.log("Comment form should be displayed at:", position)
    },
    [isCommentMode, isAuthenticated, pathname, router, userInfo],
  )

  const closeCommentForm = useCallback(() => {
    setShowCommentForm(false)
  }, [])

  const submitComment = async (text: string): Promise<boolean> => {
    if (!text || !text.trim()) return false

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login")
      toast.error("Please log in to use the feedback feature")
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname + "?commentMode=true")}`)
      return false
    }

    // Check if user has comment access
    if (!userInfo?.commentAccess) {
      console.log("User does not have comment access")
      toast.error("You don't have permission to use the feedback feature")
      return false
    }

    // Validate required fields
    if (!targetElementId) {
      console.error("Missing element ID for comment")
      toast.error("Missing element ID for comment")
      return false
    }

    try {
      console.log("Submitting comment for element:", targetElementId)

      // Store both absolute position and relative position
      const absolutePosition = {
        x: window.scrollX + commentPosition.x,
        y: window.scrollY + commentPosition.y,
      }

      // Also calculate relative position as percentage of viewport
      // This helps with different screen sizes
      const relativePosition = {
        xPercent: commentPosition.x / window.innerWidth,
        yPercent: commentPosition.y / window.innerHeight,
      }

      // Create a new comment object with both position types
      const newComment: Omit<Comment, "userId" | "userName"> = {
        id: nanoid(),
        elementId: targetElementId,
        text,
        innerHTML: targetElement?.innerHTML.substring(0, 500) || "", // Store innerHTML separately
        position: {
          ...absolutePosition,
          // Add relative position data
          xPercent: relativePosition.xPercent,
          yPercent: relativePosition.yPercent,
        },
        path: pathname || "",
        createdAt: new Date(),
        element: targetElement?.outerHTML.substring(0, 500), // Keep element for backward compatibility
      }

      // Save the comment
      const savedComment = await saveComment(newComment)
      console.log("Comment saved:", savedComment)

      if (savedComment) {
        // Update local state
        setComments((prev) => [...prev, savedComment])
        setShowCommentForm(false)
        return true
      } else {
        console.error("Failed to save comment")
        return false
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error)
      throw error
    }
  }

  // Function to view a comment for a specific element
  const viewComment = useCallback((elementId: string) => {
    console.log("Viewing comments for element:", elementId)
    setActiveCommentElementId((current) => (current === elementId ? null : elementId))
  }, [])

  // Add keyboard shortcut handler - Change to Ctrl+Alt+C
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Alt+C
      if (e.ctrlKey && e.altKey && e.key === "c") {
        e.preventDefault()
        toggleCommentMode()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [toggleCommentMode])

  return (
    <CommentContext.Provider
      value={{
        isCommentMode,
        toggleCommentMode,
        showCommentForm,
        commentPosition,
        handleContextMenu,
        submitComment,
        closeCommentForm,
        comments,
        commentsByElement,
        viewComment,
        activeCommentElementId,
        shortcutKeys: SHORTCUT_KEYS,
        isAuthenticated,
        userInfo,
      }}
    >
      {children}
    </CommentContext.Provider>
  )
}

export function useComments() {
  const context = useContext(CommentContext)
  if (context === undefined) {
    throw new Error("useComments must be used within a CommentProvider")
  }
  return context
}
