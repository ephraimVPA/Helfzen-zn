"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-2xl font-bold">Something went wrong!</h1>
      <p className="text-muted-foreground mt-2 max-w-md">An error occurred while loading this page.</p>
      <Button onClick={reset} className="mt-8">
        Try again
      </Button>
    </div>
  )
}
