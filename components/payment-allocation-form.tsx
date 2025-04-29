"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getInvoicesByVendor, getBatchById } from "@/app/receivables/data"
import { toast } from "sonner"

interface PaymentAllocationFormProps {
  paymentId: string
  vendorId: string
  remainingAmount: number
}

export function PaymentAllocationForm({ paymentId, vendorId, remainingAmount }: PaymentAllocationFormProps) {
  const router = useRouter()
  const [allocationType, setAllocationType] = useState<"invoice" | "batch">("invoice")
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("")
  const [selectedBatchId, setSelectedBatchId] = useState<string>("")
  const [amount, setAmount] = useState<string>(remainingAmount.toFixed(2))
  const [notes, setNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get open invoices for this vendor
  const vendorInvoices = getInvoicesByVendor(vendorId).filter((invoice) => invoice.status !== "Paid")

  // Get batches for this vendor
  const vendorBatches = [1, 4].map((id) => getBatchById(id.toString())).filter(Boolean)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate allocation
    const allocationAmount = Number.parseFloat(amount)
    if (isNaN(allocationAmount) || allocationAmount <= 0) {
      toast.error("Please enter a valid amount")
      setIsSubmitting(false)
      return
    }

    if (allocationAmount > remainingAmount) {
      toast.error("Allocation amount cannot exceed remaining amount")
      setIsSubmitting(false)
      return
    }

    if (allocationType === "invoice" && !selectedInvoiceId) {
      toast.error("Please select an invoice")
      setIsSubmitting(false)
      return
    }

    if (allocationType === "batch" && !selectedBatchId) {
      toast.error("Please select a batch")
      setIsSubmitting(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      toast.success("Payment allocated successfully")
      router.refresh()
      setIsSubmitting(false)

      // Reset form
      setSelectedInvoiceId("")
      setSelectedBatchId("")
      setAmount(Math.max(0, remainingAmount - allocationAmount).toFixed(2))
      setNotes("")
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocate Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Allocation Type</Label>
            <RadioGroup
              value={allocationType}
              onValueChange={(value) => setAllocationType(value as "invoice" | "batch")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="invoice" id="invoice" />
                <Label htmlFor="invoice">Invoice</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="batch" id="batch" />
                <Label htmlFor="batch">Batch</Label>
              </div>
            </RadioGroup>
          </div>

          {allocationType === "invoice" ? (
            <div className="space-y-2">
              <Label htmlFor="invoice">Select Invoice</Label>
              <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                <SelectTrigger id="invoice">
                  <SelectValue placeholder="Select an invoice" />
                </SelectTrigger>
                <SelectContent>
                  {vendorInvoices.length > 0 ? (
                    vendorInvoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.number} - ${invoice.amount.toFixed(2)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No open invoices available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="batch">Select Batch</Label>
              <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                <SelectTrigger id="batch">
                  <SelectValue placeholder="Select a batch" />
                </SelectTrigger>
                <SelectContent>
                  {vendorBatches.length > 0 ? (
                    vendorBatches.map(
                      (batch) =>
                        batch && (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.batchNumber} - ${batch.totalAmount.toFixed(2)}
                          </SelectItem>
                        ),
                    )
                  ) : (
                    <SelectItem value="none" disabled>
                      No open batches available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={remainingAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">Remaining to allocate: ${remainingAmount.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional information about this allocation"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Allocating..." : "Allocate Payment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
