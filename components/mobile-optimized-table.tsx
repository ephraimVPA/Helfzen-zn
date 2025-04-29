"use client"

import { useState } from "react"
import { ChevronRightIcon } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { Batch } from "@/app/receivables/data"

export function MobileOptimizedTable({
  data,
  onRowSelect,
}: {
  data: Batch[]
  onRowSelect?: (id: string, checked: boolean) => void
}) {
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: checked,
    }))

    if (onRowSelect) {
      onRowSelect(id, checked)
    }
  }

  return (
    <div className="space-y-0 w-full">
      {data.map((batch) => (
        <div key={batch.id} className="flex items-center border-b py-4">
          {/* Checkbox column */}
          <div className="pr-3">
            <Checkbox
              checked={selectedRows[batch.id] || false}
              onCheckedChange={(checked) => handleCheckboxChange(batch.id, !!checked)}
              aria-label={`Select batch ${batch.batchNumber}`}
            />
          </div>

          {/* Main content column */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              {/* Left side: Amount and reference */}
              <div className="flex flex-col">
                <span className="text-lg font-semibold">${batch.totalAmount.toFixed(2)}</span>
                <Link href={`/receivables/batch/${batch.id}`} className="text-primary hover:underline font-medium">
                  {batch.batchNumber}
                </Link>
                <span className="text-sm text-muted-foreground">{batch.vendor}</span>
                <Badge
                  variant={
                    batch.status === "Paid" ? "outline" : batch.status === "Overdue" ? "destructive" : "secondary"
                  }
                  className={`mt-1 w-fit ${batch.status === "Paid" ? "border-green-500 text-green-500" : ""}`}
                >
                  {batch.status}
                </Badge>
              </div>

              {/* Right side: Date */}
              <div className="text-right">
                <span className="text-sm font-medium">{batch.weekEnding}</span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pl-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/receivables/batch/${batch.id}`}>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Button>
          </div>
        </div>
      ))}

      {data.length === 0 && <div className="py-8 text-center text-muted-foreground">No batches found.</div>}
    </div>
  )
}
