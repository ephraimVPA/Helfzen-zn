"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

export function InvoiceNotes({ invoiceId, initialNotes = "" }: { invoiceId: string; initialNotes?: string }) {
  const [notes, setNotes] = useState(initialNotes)
  const [isEditing, setIsEditing] = useState(false)
  const [savedNotes, setSavedNotes] = useState(initialNotes)

  const handleSave = () => {
    // In a real app, you would save the notes to the server
    setSavedNotes(notes)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setNotes(savedNotes)
    setIsEditing(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes about this invoice..."
                className="min-h-[150px] w-full"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="min-h-[100px] whitespace-pre-wrap break-words">{savedNotes || "No notes available."}</div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Notes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
