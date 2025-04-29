"use client"

import { useState } from "react"
import { ChevronRightIcon } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Batch } from "@/app/receivables/data"

export function ReceivablesMobileView({
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="space-y-0 w-full">
      {data.map((batch) => (
        <div key={batch.id} className="flex items-center border-b py-4">
          {/* Checkbox column */}
          <div className="pr-3 checkbox-container">
            <Checkbox
              className="checkbox-mobile"
              checked={selectedRows[batch.id] || false}
              onCheckedChange={(checked) => handleCheckboxChange(batch.id, !!checked)}
              aria-label={`Select batch ${batch.batchNumber}`}
            />
          </div>

          {/* Main content column */}
          <div className="flex-1 min-w-0">
            <Link href={`/receivables/${batch.id}`} className="block">
              <div className="flex justify-between items-start">
                {/* Left side: Amount and reference */}
                <div className="flex flex-col">
                  <span className="text-xl font-bold">{formatCurrency(batch.totalAmount)}</span>
                  <span className="text-primary font-medium">{batch.batchNumber}</span>
                  <span className="text-muted-foreground">{batch.vendor}</span>
                  <Badge
                    variant={batch.status === "Paid" ? "outline" : batch.status === "Pending" ? "secondary" : "default"}
                    className={`mt-1 w-fit ${
                      batch.status === "Paid"
                        ? "border-green-500 text-green-500 bg-transparent"
                        : batch.status === "Partial"
                          ? "bg-blue-500"
                          : ""
                    }`}
                  >
                    {batch.status}
                  </Badge>
                </div>

                {/* Right side: Date */}
                <div className="text-right">
                  <span className="text-sm font-medium">{batch.date}</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Action button */}
          <div className="pl-2">
            <Link href={`/receivables/${batch.id}`} className="flex items-center justify-center h-10 w-10">
              <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
            </Link>
          </div>
        </div>
      ))}

      {data.length === 0 && <div className="py-8 text-center text-muted-foreground">No batches found.</div>}
    </div>
  )
}
