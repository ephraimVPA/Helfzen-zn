"use client"

import { ArrowLeft, CalendarIcon, Clock, DollarSign, FileText, Send } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getBatchById } from "@/app/receivables/data"
import { useIsMobile } from "@/hooks/use-mobile"
import { ResponsiveTable } from "@/components/ui/responsive-table"

export default function BatchDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const isMobile = useIsMobile()

  // Get the batch data
  const batch = getBatchById(id)

  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h1 className="text-2xl font-semibold">Batch not found</h1>
        <p className="text-muted-foreground">The batch you're looking for doesn't exist or has been removed.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/receivables">Back to Receivables</Link>
        </Button>
      </div>
    )
  }

  // Define invoice columns for responsive table
  const invoiceColumns = [
    {
      key: "number",
      header: "Invoice #",
      cell: (invoice: any) => (
        <Link
          href={`/receivables/batch/${batch.id}/invoice/${invoice.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {invoice.number}
        </Link>
      ),
    },
    {
      key: "nurseName",
      header: "Nurse",
    },
    {
      key: "shift",
      header: "Shift",
    },
    {
      key: "hours",
      header: "Hours",
    },
    {
      key: "rate",
      header: "Rate",
      cell: (invoice: any) => <>${invoice.rate.toFixed(2)}</>,
    },
    {
      key: "amount",
      header: "Amount",
      cell: (invoice: any) => <div className="text-right">${invoice.amount.toFixed(2)}</div>,
      className: "text-right",
    },
    {
      key: "status",
      header: "Status",
      cell: (invoice: any) => (
        <Badge
          variant={
            invoice.status === "Paid"
              ? "outline"
              : invoice.status === "Overdue"
                ? "destructive"
                : invoice.status === "Partially Paid"
                  ? "default"
                  : "outline"
          }
          className={invoice.status === "Paid" ? "border-green-500 text-green-500" : ""}
        >
          {invoice.status}
        </Badge>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href="/receivables">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-semibold truncate">Batch {batch.batchNumber}</h1>
          <p className="text-sm text-muted-foreground truncate">
            {batch.vendor} • Week Ending: {batch.weekEnding}
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={
                  batch.status === "Overdue"
                    ? "destructive"
                    : batch.status === "Paid"
                      ? "outline"
                      : batch.status === "Partially Paid"
                        ? "default"
                        : "outline"
                }
                className={batch.status === "Paid" ? "border-green-500 text-green-500" : ""}
              >
                {batch.status}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {batch.status === "Overdue"
                ? "Payment is past the due date"
                : batch.status === "Paid"
                  ? "Payment has been received in full"
                  : batch.status === "Partially Paid"
                    ? "Partial payment has been received"
                    : "Batch has been submitted but not yet paid"}
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
                <div className="font-medium">${batch.totalAmount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Paid Amount</div>
                <div className="font-medium">${batch.paidAmount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="font-medium">{batch.status}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Invoices</div>
                <div className="font-medium">{batch.invoices.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Batch Details</CardTitle>
            <CardDescription>Complete information about this batch</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Tabs defaultValue="invoices">
              <TabsList className="mb-4 w-full sm:w-auto flex flex-wrap">
                <TabsTrigger value="invoices" className="flex-1 sm:flex-none">
                  Invoices
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 sm:flex-none">
                  History
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex-1 sm:flex-none">
                  Notes
                </TabsTrigger>
              </TabsList>
              <TabsContent value="invoices">
                <ResponsiveTable
                  data={batch.invoices || []}
                  columns={invoiceColumns}
                  emptyMessage="No invoices found in this batch."
                />
              </TabsContent>
              <TabsContent value="history">
                <div className="text-sm text-muted-foreground">
                  <p>Batch history will be available in a future update.</p>
                </div>
              </TabsContent>
              <TabsContent value="notes">
                <div className="text-sm text-muted-foreground">
                  <p>Batch notes will be available in a future update.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
            <Button variant="outline" className="w-full sm:w-auto">
              Download Batch PDF
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {batch.status === "Overdue" && (
                <Button variant="outline" className="w-full sm:w-auto">
                  <Send className="mr-2 h-4 w-4" />
                  Send Reminder
                </Button>
              )}
              {(batch.status === "Overdue" || batch.status === "Submitted") && (
                <Button variant="default" className="w-full sm:w-auto">
                  <FileText className="mr-2 h-4 w-4" />
                  Resubmit Batch
                </Button>
              )}
              {batch.status !== "Paid" && (
                <Button variant="default" className="w-full sm:w-auto">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Mark as Paid
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-4 md:gap-6 md:block hidden">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <div className="font-medium">{batch.vendor}</div>
                <div className="text-sm text-muted-foreground">Vendor ID: {batch.vendorId}</div>
              </div>
              <Separator />
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Total Amount:</div>
                  <div>${batch.totalAmount.toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-medium">Paid Amount:</div>
                  <div>${batch.paidAmount.toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-medium">Balance:</div>
                  <div>${(batch.totalAmount - batch.paidAmount).toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Batch Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">Week Ending</div>
                </div>
                <div>{batch.weekEnding}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">Status</div>
                </div>
                <div className={batch.status === "Overdue" ? "text-destructive font-medium" : ""}>{batch.status}</div>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-medium">
                <div>Total Invoices</div>
                <div>{batch.invoices.length}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
