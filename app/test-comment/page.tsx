import { SimpleCommentForm } from "@/components/simple-comment-form"

export default function TestCommentPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Test Comment Submission</h1>
      <p className="mb-6">
        This page allows you to test the comment submission functionality directly, bypassing the context menu and other
        complex interactions.
      </p>

      <SimpleCommentForm />
    </div>
  )
}
