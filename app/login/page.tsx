"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard"
  const errorParam = searchParams?.get("error")

  useEffect(() => {
    // Handle error messages from the OAuth flow
    if (errorParam) {
      console.log("Error parameter detected:", errorParam)

      switch (errorParam) {
        case "unauthorized":
          setError("You are not authorized to access this application. Only users listed in the system can log in.")
          break
        case "auth_error":
          setError("An error occurred during authentication. Please try again.")
          break
        case "missing_code":
          setError("Authentication code is missing. Please try again.")
          break
        default:
          setError(`An error occurred: ${errorParam}. Please try again.`)
      }
    }
  }, [errorParam])

  const handleGoogleLogin = async () => {
    try {
      console.log("Starting Google login flow")
      setIsLoading(true)
      setError("")

      // Redirect to Google OAuth flow
      // Include the callback URL as state parameter
      const encodedCallbackUrl = encodeURIComponent(callbackUrl)
      console.log("Redirecting to Google auth with callback:", encodedCallbackUrl)

      // Use window.location.href for a full page redirect
      window.location.href = `/api/auth/google?state=${encodedCallbackUrl}`
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            {callbackUrl.includes("commentMode=true")
              ? "Login required to enter feedback mode"
              : "Sign in with your Google account to access the dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <div className="text-sm text-muted-foreground">
            <p>Only users listed in the system can log in.</p>
            <p className="mt-1">Your access will be determined by your Google email address.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGoogleLogin} className="w-full" disabled={isLoading} variant="outline">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FcGoogle className="h-5 w-5" />
                Sign in with Google
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
