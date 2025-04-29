"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"

export function NotFoundProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex min-h-screen">
        <div className="flex flex-col flex-1 w-full overflow-x-hidden">
          <main className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  )
}
