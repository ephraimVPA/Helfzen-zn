import { format } from "date-fns"
import { ArrowLeft, ExternalLink, MessageCircle, Trash2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getComments, deleteComment } from "@/actions/comment-actions"
import { Badge } from "@/components/ui/badge"

export default async function CommentsPage() {
  console.log("Admin: Fetching comments for admin page")
  const comments = await getComments()
  console.log(`Admin: Retrieved ${comments.length} comments`)

  // Group comments by page path
  const commentsByPath = comments.reduce(
    (acc, comment) => {
      const path = comment.path || "unknown"
      if (!acc[path]) {
        acc[path] = []
      }
      acc[path].push(comment)
      return acc
    },
    {} as Record<string, typeof comments>,
  )

  // Further group by element within each page
  const groupedByElement = Object.entries(commentsByPath).map(([path, pathComments]) => {
    const elementGroups = pathComments.reduce(
      (acc, comment) => {
        const selector = comment.elementId || "unknown"
        if (!acc[selector]) {
          acc[selector] = []
        }
        acc[selector].push(comment)
        return acc
      },
      {} as Record<string, typeof comments>,
    )

    return { path, elementGroups }
  })

  // Helper function to safely format dates
  const safeFormatDate = (dateStr: string | Date) => {
    try {
      const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Unknown date"
      }
      return format(date, "PPP 'at' p")
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Unknown date"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">User Feedback</h1>
          <p className="text-sm text-muted-foreground">Review feedback submitted by users during MVP testing</p>
        </div>
      </div>

      <div className="grid gap-6">
        {groupedByElement.map(({ path, elementGroups }) => (
          <Card key={path}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span>Page: {path}</span>
                    <Badge variant="outline">{Object.values(elementGroups).flat().length}</Badge>
                  </CardTitle>
                  <CardDescription>Feedback collected from this page</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={path}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Page
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(elementGroups).map(([selector, elementComments]) => (
                  <div key={selector} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-medium">
                        Element: <code className="text-xs bg-muted p-1 rounded">{selector}</code>
                      </h3>
                      <Badge variant="outline">{elementComments.length}</Badge>
                    </div>

                    <div className="space-y-4 mt-4">
                      {elementComments.map((comment) => (
                        <div key={comment.id} className="rounded-lg bg-muted/50 p-4">
                          <div className="flex justify-between">
                            <div className="text-sm text-muted-foreground">
                              {comment.createdAt ? safeFormatDate(comment.createdAt) : "Unknown date"}
                              {comment.userId && ` • ${comment.userName || comment.userId}`}
                            </div>
                            <form
                              action={async () => {
                                "use server"
                                await deleteComment(comment.id)
                              }}
                            >
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </form>
                          </div>
                          <p className="mt-2">{comment.text}</p>
                          {comment.innerHTML && (
                            <>
                              <Separator className="my-2" />
                              <div className="text-xs text-muted-foreground">
                                <div className="font-medium">Element content:</div>
                                <code className="mt-1 block overflow-x-auto whitespace-pre-wrap rounded bg-muted p-2">
                                  {comment.innerHTML}
                                </code>
                              </div>
                            </>
                          )}
                          {!comment.innerHTML && comment.element && (
                            <>
                              <Separator className="my-2" />
                              <div className="text-xs text-muted-foreground">
                                <div className="font-medium">Element context:</div>
                                <code className="mt-1 block overflow-x-auto whitespace-pre-wrap rounded bg-muted p-2">
                                  {comment.element}
                                </code>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {groupedByElement.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-muted-foreground">No feedback has been submitted yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
