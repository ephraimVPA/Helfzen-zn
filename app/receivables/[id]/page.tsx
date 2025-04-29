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
import { useComments } from "@/contexts/comment-context"

export default function InvoiceDetailPage() {
  const { handleContextMenu, isCommentMode } = useComments()
  const params = useParams()
  const id = params.id as string

  // This would normally be fetched from an API
  const invoice = {
    id: id,
    number: "INV-2023-001",
    facility: "Memorial Hospital",
    amount: 4250.75,
    status: "Overdue",
    dueDate: "2023-11-15",
    issueDate: "2023-10-15",
    address: "123 Healthcare Ave, Medical District, NY 10001",
    contact: "John Smith",
    email: "billing@memorialhospital.org",
    phone: "(555) 123-4567",
    notes: "Invoice is 30 days overdue. Second reminder sent on Nov 30.",
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/receivables">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Invoice {invoice.number}</h1>
          <p className="text-sm text-muted-foreground">
            {invoice.facility} • {invoice.issueDate}
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={
                  invoice.status === "Overdue" ? "destructive" : invoice.status === "Paid" ? "outline" : "outline"
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

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Complete information about this invoice</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="line-items">
              <TabsList className="mb-4">
                <TabsTrigger value="line-items">Line Items</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="line-items">
                <InvoiceLineItems invoiceId={invoice.id} />
              </TabsContent>
              <TabsContent value="history">
                <InvoiceHistory invoiceId={invoice.id} />
              </TabsContent>
              <TabsContent value="notes">
                <InvoiceNotes invoiceId={invoice.id} initialNotes={invoice.notes} />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Download PDF</Button>
            <div className="flex gap-2">
              {invoice.status === "Overdue" && (
                <Button variant="outline">
                  <Send className="mr-2 h-4 w-4" />
                  Send Reminder
                </Button>
              )}
              {(invoice.status === "Overdue" || invoice.status === "Pending") && (
                <Button variant="default">
                  <FileText className="mr-2 h-4 w-4" />
                  Resubmit Invoice
                </Button>
              )}
              {invoice.status !== "Paid" && (
                <Button variant="default">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Mark as Paid
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Facility Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <div className="font-medium">{invoice.facility}</div>
                <div className="text-sm text-muted-foreground whitespace-pre-line">{invoice.address}</div>
              </div>
              <Separator />
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <div className="font-medium">Contact:</div>
                  <div>{invoice.contact}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-medium">Email:</div>
                  <div>{invoice.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-medium">Phone:</div>
                  <div>{invoice.phone}</div>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
