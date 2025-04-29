"use client"
import { PlusIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReceivablesTable } from "@/components/receivables-table"
import { DateRangePicker } from "@/components/date-range-picker"
import { useIsMobile } from "@/hooks/use-mobile"

export default function ReceivablesPage() {
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Receivables</h1>
          {!isMobile && <p className="text-sm text-muted-foreground">Manage and track batches and invoices</p>}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
          <DateRangePicker />
          <Button asChild className="w-full sm:w-auto">
            <Link href="/receivables/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Batch
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        {!isMobile && (
          <CardHeader>
            <CardTitle>Batch Management</CardTitle>
            <CardDescription>View, manage, and track batches of invoices</CardDescription>
          </CardHeader>
        )}
        <CardContent className={isMobile ? "px-3 pt-3" : ""}>
          <ReceivablesTable />
        </CardContent>
      </Card>
    </div>
  )
}
