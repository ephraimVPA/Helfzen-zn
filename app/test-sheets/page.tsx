"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TestSheetsPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testText, setTestText] = useState("Test comment")
  const [elementId, setElementId] = useState("test-element-1")
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/test-sheets", {
        method: "GET",
      })
      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error("Error testing connection:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const testAddComment = async () => {
    if (!testText.trim() || !elementId.trim()) {
      setError("Both text and element ID are required")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/test-sheets/add-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: testText,
          elementId,
          path: "/test-sheets",
          position: { x: 100, y: 100 },
        }),
      })
      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error("Error adding test comment:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Google Sheets Integration Test</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Google Sheets Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testConnection} disabled={loading}>
              {loading ? "Testing..." : "Test Connection"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Add Comment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="elementId">Element ID</Label>
              <Input
                id="elementId"
                value={elementId}
                onChange={(e) => setElementId(e.target.value)}
                placeholder="Enter element ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testText">Comment Text</Label>
              <Textarea
                id="testText"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter test comment"
              />
            </div>
            <Button onClick={testAddComment} disabled={loading}>
              {loading ? "Adding..." : "Add Test Comment"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
