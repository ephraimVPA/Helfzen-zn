"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

import { ThemeProvider } from "@/components/theme-provider"
import { CommentProvider } from "@/contexts/comment-context"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { FeedbackToggle } from "@/components/feedback-toggle"
import { CommentForm } from "@/components/comment-form"
import { CommentIndicator } from "@/components/comment-indicator"

// Wrapper component to handle sidebar state based on navigation
function SidebarController({ children }: { children: React.ReactNode }) {
  const { setOpenMobile } = useSidebar()
  const pathname = usePathname()

  // Close mobile sidebar on navigation
  useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  // Handle resize events to ensure proper sidebar state
  useEffect(() => {
    const handleResize = () => {
      // Close mobile sidebar when resizing to desktop
      if (window.innerWidth >= 1024) {
        setOpenMobile(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [setOpenMobile])

  return <>{children}</>
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <CommentProvider>
        <SidebarProvider>
          <SidebarController>
            <div className="flex min-h-screen overflow-x-hidden">
              <AppSidebar />
              <div className="flex flex-col flex-1 w-full overflow-x-hidden">
                <MobileHeader />
                <main className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full overflow-x-hidden">{children}</main>
              </div>
            </div>
            <FeedbackToggle />
            <CommentForm />
            <CommentIndicator />
          </SidebarController>
        </SidebarProvider>
      </CommentProvider>
    </ThemeProvider>
  )
}
