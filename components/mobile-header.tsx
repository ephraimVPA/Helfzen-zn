"use client"

import { MenuIcon, BellIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

export function MobileHeader() {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()

  // Get the current page title based on the pathname
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname === "/receivables") return "Receivables"
    if (pathname.startsWith("/receivables/payments")) return "Payments"
    if (pathname.startsWith("/receivables/batch")) {
      if (pathname.includes("/invoice/")) return "Invoice Details"
      return "Batch Details"
    }
    if (pathname === "/reports") return "Reports"
    if (pathname === "/apps") return "Apps & Integrations"
    if (pathname === "/settings") return "Settings"
    if (pathname === "/admin/comments") return "User Feedback"
    return "Helfzen"
  }

  return (
    <div className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static lg:hidden">
      <Button variant="outline" size="icon" className="mr-2" onClick={toggleSidebar}>
        <MenuIcon className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex-1 text-center lg:text-left">
        <Link href="/dashboard" className="text-lg font-semibold">
          {getPageTitle()}
        </Link>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <BellIcon className="h-5 w-5" />
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
            <span className="sr-only">Notifications</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full max-w-sm">
          <div className="py-4">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border p-3">
                <div className="font-medium">New payment received</div>
                <div className="text-sm text-muted-foreground">Memorial Hospital - $5,000.00</div>
                <div className="text-xs text-muted-foreground mt-1">2 hours ago</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="font-medium">Invoice overdue</div>
                <div className="text-sm text-muted-foreground">City Medical Center - INV-2023-004</div>
                <div className="text-xs text-muted-foreground mt-1">Yesterday</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="font-medium">New comment added</div>
                <div className="text-sm text-muted-foreground">Eddie Lake added a comment to batch B-2023-W42</div>
                <div className="text-xs text-muted-foreground mt-1">3 days ago</div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
