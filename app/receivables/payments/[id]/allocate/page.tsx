"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { getPaymentById, getInvoicesByVendor, getBatchById } from "@/app/receivables/data"
import { toast } from "sonner"

export default function AllocatePaymentPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  // Get the payment data
  const payment = getPaymentById(id)

  const [allocationType, setAllocationType] = useState<"invoice" | "batch">("invoice")
  const [selectedInvoices, setSelectedInvoices] = useState<Record<string, boolean>>({})
  const [selectedBatchId, setSelectedBatchId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h1 className="text-2xl font-semibold">Payment not found</h1>
        <p className="text-muted-foreground">The payment you're looking for doesn't exist or has been removed.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/receivables/payments">Back to Payments</Link>
        </Button>
      </div>
    )
  }

  // Calculate allocation totals
  const totalAllocated = payment.allocations.reduce((sum, allocation) => sum + allocation.amount, 0)
  const remainingToAllocate = payment.amount - totalAllocated

  // Get open invoices for this vendor
  const vendorInvoices = getInvoicesByVendor(payment.vendorId).filter((invoice) => invoice.status !== "Paid")

  // Get batches for this vendor
  const vendorBatches = [1, 4].map((id) => getBatchById(id.toString())).filter(Boolean)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast.success("Payment allocated successfully")
      router.push(`/receivables/payments/${id}`)
    }, 1500)
  }

  const toggleInvoice = (invoiceId: string) => {
    setSelectedInvoices((prev) => ({
      ...prev,
      [invoiceId]: !prev[invoiceId],
    }))
  }

  const selectedInvoiceCount = Object.values(selectedInvoices).filter(Boolean).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/receivables/payments/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Allocate Payment</h1>
          <p className="text-sm text-muted-foreground">
            {payment.reference} • ${payment.amount.toFixed(2)} • ${remainingToAllocate.toFixed(2)} remaining
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Allocation Options</CardTitle>
          <CardDescription>Choose how to allocate this payment</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="invoices">
            <TabsList className="mb-4">
              <TabsTrigger value="invoices">Allocate to Invoices</TabsTrigger>
              <TabsTrigger value="batch">Allocate to Batch</TabsTrigger>
            </TabsList>

            <TabsContent value="invoices">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            onCheckedChange={(checked) => {
                              const newSelected: Record<string, boolean> = {}
                              vendorInvoices.forEach((invoice) => {
                                newSelected[invoice.id] = !!checked
                              })
                              setSelectedInvoices(newSelected)
                            }}
                            checked={vendorInvoices.length > 0 && selectedInvoiceCount === vendorInvoices.length}
                            indeterminate={selectedInvoiceCount > 0 && selectedInvoiceCount < vendorInvoices.length}
                          />
                        </TableHead>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Remaining</TableHead>
                        <TableHead>Allocation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorInvoices.length > 0 ? (
                        vendorInvoices.map((invoice) => {
                          const paidAmount = invoice.paidAmount || 0
                          const remainingAmount = invoice.amount - paidAmount

                          return (
                            <TableRow key={invoice.id}>
                              <TableCell>
                                <Checkbox
                                  checked={!!selectedInvoices[invoice.id]}
                                  onCheckedChange={() => toggleInvoice(invoice.id)}
                                />
                              </TableCell>
                              <TableCell>{invoice.number}</TableCell>
                              <TableCell>{invoice.issueDate}</TableCell>
                              <TableCell>{invoice.dueDate}</TableCell>
                              <TableCell className="text-right">${invoice.amount.toFixed(2)}</TableCell>
                              <TableCell className="text-right">${remainingAmount.toFixed(2)}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max={Math.min(remainingAmount, remainingToAllocate)}
                                  placeholder="0.00"
                                  disabled={!selectedInvoices[invoice.id]}
                                />
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No open invoices found for this vendor.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Selected: {selectedInvoiceCount} invoices</p>
                    <p className="text-sm text-muted-foreground">
                      Remaining to allocate: ${remainingToAllocate.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" type="button" asChild>
                      <Link href={`/receivables/payments/${id}`}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting || selectedInvoiceCount === 0}>
                      {isSubmitting ? "Allocating..." : "Allocate to Invoices"}
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="batch">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
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

                  {selectedBatchId && (
                    <div className="rounded-md border p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Batch Number</p>
                          <p className="font-medium">{getBatchById(selectedBatchId)?.batchNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Week Ending</p>
                          <p className="font-medium">{getBatchById(selectedBatchId)?.weekEnding}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="font-medium">${getBatchById(selectedBatchId)?.totalAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Paid Amount</p>
                          <p className="font-medium">${getBatchById(selectedBatchId)?.paidAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <Label htmlFor="batchAmount">Allocation Amount</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5">$</span>
                          <Input
                            id="batchAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            max={remainingToAllocate}
                            defaultValue={remainingToAllocate.toFixed(2)}
                            className="pl-7"
                            required
                          />
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <Label htmlFor="batchNotes">Notes</Label>
                        <Textarea id="batchNotes" placeholder="Additional information about this allocation" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Remaining to allocate: ${remainingToAllocate.toFixed(2)}
                  </p>
                  <div className="space-x-2">
                    <Button variant="outline" type="button" asChild>
                      <Link href={`/receivables/payments/${id}`}>Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !selectedBatchId}>
                      {isSubmitting ? "Allocating..." : "Allocate to Batch"}
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
