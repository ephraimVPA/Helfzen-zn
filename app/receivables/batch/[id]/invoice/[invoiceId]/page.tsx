"use client"

import { ArrowLeft, CalendarIcon, Clock, DollarSign, FileText, Send } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvoiceLineItems } from "@/components/invoice-line-items"
import { InvoiceHistory } from "@/components/invoice-history"
import { InvoiceNotes } from "@/components/invoice-notes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getBatchById, getInvoiceById } from "@/app/receivables/data"
import { useIsMobile } from "@/hooks/use-mobile"

export default function InvoiceDetailPage() {
  const params = useParams()
  const batchId = params.id as string
  const invoiceId = params.invoiceId as string
  const isMobile = useIsMobile()

  // Get the batch and invoice data
  const batch = getBatchById(batchId)
  const invoice = batch ? getInvoiceById(batchId, invoiceId) : null

  if (!batch || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h1 className="text-2xl font-semibold">Invoice not found</h1>
        <p className="text-muted-foreground">The invoice you're looking for doesn't exist or has been removed.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={`/receivables/batch/${batchId}`}>Back to Batch</Link>
        </Button>
      </div>
    )
  }

  // Calculate payment status details
  const paymentStatus = {
    paid: invoice.status === "Paid",
    partiallyPaid: invoice.status === "Partially Paid",
    overdue: invoice.status === "Overdue",
    pending: invoice.status === "Pending",
    paidAmount:
      invoice.status === "Partially Paid" ? invoice.amount * 0.5 : invoice.status === "Paid" ? invoice.amount : 0,
    remainingAmount:
      invoice.status === "Partially Paid" ? invoice.amount * 0.5 : invoice.status === "Paid" ? 0 : invoice.amount,
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/receivables/batch/${batchId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-semibold truncate">Invoice {invoice.number}</h1>
          <p className="text-sm text-muted-foreground truncate">
            Batch {batch.batchNumber} • {invoice.issueDate}
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={
                  invoice.status === "Overdue"
                    ? "destructive"
                    : invoice.status === "Paid"
                      ? "outline"
                      : invoice.status === "Partially Paid"
                        ? "default"
                        : "outline"
                }
                className={invoice.status === "Paid" ? "border-green-500 text-green-500" : ""}
              >
                {invoice.status}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {invoice.status === "Overdue"
                ? "Payment is past the due date"
                : invoice.status === "Paid"
                  ? "Payment has been received in full"
                  : invoice.status === "Partially Paid"
                    ? "Partial payment has been received"
                    : "Invoice has been sent but not yet paid"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Mobile Summary Card - Only visible on mobile */}
      {isMobile && (
        <Card className="md:hidden">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Amount</div>
                <div className="font-medium">${invoice.amount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="font-medium">{invoice.status}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Due Date</div>
                <div className={invoice.status === "Overdue" ? "text-destructive font-medium" : ""}>
                  {invoice.dueDate}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Nurse</div>
                <div className="font-medium">{invoice.nurseName}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Complete information about this invoice</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details">
              <TabsList className="mb-4 w-full sm:w-auto flex flex-wrap">
                <TabsTrigger value="details" className="flex-1 sm:flex-none">
                  Details
                </TabsTrigger>
                <TabsTrigger value="line-items" className="flex-1 sm:flex-none">
                  Line Items
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 sm:flex-none">
                  History
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex-1 sm:flex-none">
                  Notes
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="min-w-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Invoice Number</h3>
                    <p className="break-words">{invoice.number}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Issue Date</h3>
                    <p>{invoice.issueDate}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Due Date</h3>
                    <p className={invoice.status === "Overdue" ? "text-destructive font-medium" : ""}>
                      {invoice.dueDate}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Status</h3>
                    <p>
                      <Badge
                        variant={
                          invoice.status === "Overdue"
                            ? "destructive"
                            : invoice.status === "Paid"
                              ? "outline"
                              : invoice.status === "Partially Paid"
                                ? "default"
                                : "outline"
                        }
                        className={invoice.status === "Paid" ? "border-green-500 text-green-500" : ""}
                      >
                        {invoice.status}
                      </Badge>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Nurse</h3>
                    <p className="break-words">{invoice.nurseName}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Shift</h3>
                    <p>{invoice.shift}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Hours</h3>
                    <p>{invoice.hours}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Rate</h3>
                    <p>${invoice.rate.toFixed(2)}/hr</p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Payment Status</h3>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <div className="rounded-lg border p-4">
                      <div className="text-sm text-muted-foreground">Total Amount</div>
                      <div className="mt-1 text-xl md:text-2xl font-bold">${invoice.amount.toFixed(2)}</div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-sm text-muted-foreground">Paid Amount</div>
                      <div className="mt-1 text-xl md:text-2xl font-bold text-green-600">
                        ${paymentStatus.paidAmount.toFixed(2)}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-sm text-muted-foreground">Remaining</div>
                      <div className="mt-1 text-xl md:text-2xl font-bold text-amber-600">
                        ${paymentStatus.remainingAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="line-items">
                <div className="overflow-x-auto table-container custom-scrollbar">
                  <InvoiceLineItems invoiceId={invoice.id} />
                </div>
              </TabsContent>
              <TabsContent value="history">
                <div className="overflow-x-auto table-container custom-scrollbar">
                  <InvoiceHistory invoiceId={invoice.id} />
                </div>
              </TabsContent>
              <TabsContent value="notes">
                <div className="overflow-x-auto">
                  <InvoiceNotes
                    invoiceId={invoice.id}
                    initialNotes={`Invoice for ${invoice.nurseName}, ${invoice.shift} shift, ${invoice.hours} hours.`}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
            <Button variant="outline" className="w-full sm:w-auto">
              Download PDF
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {invoice.status === "Overdue" && (
                <Button variant="outline" className="w-full sm:w-auto">
                  <Send className="mr-2 h-4 w-4" />
                  Send Reminder
                </Button>
              )}
              {(invoice.status === "Overdue" || invoice.status === "Pending") && (
                <Button variant="default" className="w-full sm:w-auto">
                  <FileText className="mr-2 h-4 w-4" />
                  Resubmit Invoice
                </Button>
              )}
              {invoice.status !== "Paid" && (
                <Button variant="default" className="w-full sm:w-auto">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-4 md:gap-6 md:block hidden">
          <Card>
            <CardHeader>
              <CardTitle>Facility Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <div className="font-medium">{batch.vendor}</div>
                <div className="text-sm text-muted-foreground">Vendor ID: {batch.vendorId}</div>
              </div>
              <Separator />
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <div className="font-medium">Batch:</div>
                  <div>{batch.batchNumber}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-medium">Week Ending:</div>
                  <div>{batch.weekEnding}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">Issue Date</div>
                </div>
                <div>{invoice.issueDate}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">Due Date</div>
                </div>
                <div className={invoice.status === "Overdue" ? "text-destructive font-medium" : ""}>
                  {invoice.dueDate}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-medium">
                <div>Total Amount</div>
                <div>${invoice.amount.toFixed(2)}</div>
              </div>
              {paymentStatus.partiallyPaid && (
                <>
                  <div className="flex items-center justify-between">
                    <div>Paid Amount</div>
                    <div className="text-green-600">${paymentStatus.paidAmount.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Remaining</div>
                    <div className="text-amber-600">${paymentStatus.remainingAmount.toFixed(2)}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
