import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NotFoundProviders } from "@/components/not-found-providers"

export default function NotFound() {
  return (
    <NotFoundProviders>
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-4 text-xl">Page not found</p>
        <p className="mt-2 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <Button asChild className="mt-8">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </NotFoundProviders>
  )
}
