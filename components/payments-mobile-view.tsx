"use client"

import { useState } from "react"
import { ChevronRightIcon } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Payment } from "@/app/receivables/data"

export function PaymentsMobileView({
  data,
  onRowSelect,
}: {
  data: Payment[]
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
      {data.map((payment) => (
        <div key={payment.id} className="flex items-center border-b py-4">
          {/* Checkbox column */}
          <div className="pr-3 checkbox-container">
            <Checkbox
              className="checkbox-mobile"
              checked={selectedRows[payment.id] || false}
              onCheckedChange={(checked) => handleCheckboxChange(payment.id, !!checked)}
              aria-label={`Select payment ${payment.reference}`}
            />
          </div>

          {/* Main content column */}
          <div className="flex-1 min-w-0">
            <Link href={`/receivables/payments/${payment.id}`} className="block">
              <div className="flex justify-between items-start">
                {/* Left side: Amount and reference */}
                <div className="flex flex-col">
                  <span className="text-xl font-bold">{formatCurrency(payment.amount)}</span>
                  <span className="text-primary font-medium">{payment.reference}</span>
                  <span className="text-muted-foreground">{payment.vendor}</span>
                  <Badge
                    variant={
                      payment.status === "Applied" ? "outline" : payment.status === "Pending" ? "secondary" : "default"
                    }
                    className={`mt-1 w-fit ${
                      payment.status === "Applied"
                        ? "border-green-500 text-green-500 bg-transparent"
                        : payment.status === "Partially Applied"
                          ? "bg-blue-500"
                          : ""
                    }`}
                  >
                    {payment.status === "Partially Applied" ? "Partially Applied" : payment.status}
                  </Badge>
                </div>

                {/* Right side: Date */}
                <div className="text-right">
                  <span className="text-sm font-medium">{payment.date}</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Action button */}
          <div className="pl-2">
            <Link href={`/receivables/payments/${payment.id}`} className="flex items-center justify-center h-10 w-10">
              <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
            </Link>
          </div>
        </div>
      ))}

      {data.length === 0 && <div className="py-8 text-center text-muted-foreground">No payments found.</div>}
    </div>
  )
}
