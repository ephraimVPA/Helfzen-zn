"use client"

import { ArrowLeft, CalendarIcon, DollarSign } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPaymentById } from "@/app/receivables/data"
import { PaymentAllocationForm } from "@/components/payment-allocation-form"

export default function PaymentDetailPage() {
  const params = useParams()
  const id = params?.id as string

  // Get the payment data
  const payment = getPaymentById(id)

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
  const isFullyAllocated = remainingToAllocate <= 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/receivables/payments">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Payment {payment.reference}</h1>
          <p className="text-sm text-muted-foreground">
            {payment.vendor} • {payment.date}
          </p>
        </div>
        <Badge
          variant={payment.status === "Applied" ? "outline" : payment.status === "Pending" ? "secondary" : "default"}
          className={payment.status === "Applied" ? "border-green-500 text-green-500" : ""}
        >
          {payment.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Complete information about this payment</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="allocations">
              <TabsList className="mb-4">
                <TabsTrigger value="allocations">Allocations</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              <TabsContent value="allocations">
                {payment.allocations.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payment.allocations.map((allocation) => (
                          <TableRow key={allocation.id}>
                            <TableCell>{allocation.date}</TableCell>
                            <TableCell>{allocation.invoiceId ? "Invoice" : "Batch"}</TableCell>
                            <TableCell>
                              {allocation.invoiceId ? (
                                <Link
                                  href={`/receivables/batch/${allocation.invoiceId.split("-")[0]}/invoice/${allocation.invoiceId}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  Invoice
                                </Link>
                              ) : (
                                <Link
                                  href={`/receivables/batch/${allocation.batchId}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  Batch
                                </Link>
                              )}
                            </TableCell>
                            <TableCell className="text-right">${allocation.amount.toFixed(2)}</TableCell>
                            <TableCell>{allocation.notes || "-"}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-bold">
                            Total Allocated:
                          </TableCell>
                          <TableCell className="text-right font-bold">${totalAllocated.toFixed(2)}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                        {!isFullyAllocated && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-bold">
                              Remaining to Allocate:
                            </TableCell>
                            <TableCell className="text-right font-bold text-amber-600">
                              ${remainingToAllocate.toFixed(2)}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="rounded-md border p-8 text-center">
                    <p className="text-muted-foreground">No allocations have been made for this payment yet.</p>
                    <Button className="mt-4" asChild>
                      <Link href={`/receivables/payments/${payment.id}/allocate`}>Allocate Payment</Link>
                    </Button>
                  </div>
                )}

                {!isFullyAllocated && payment.allocations.length > 0 && (
                  <div className="mt-6">
                    <PaymentAllocationForm
                      paymentId={payment.id}
                      vendorId={payment.vendorId}
                      remainingAmount={remainingToAllocate}
                    />
                  </div>
                )}
              </TabsContent>
              <TabsContent value="details">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Reference Number</h3>
                    <p>{payment.reference}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Payment Date</h3>
                    <p>{payment.date}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Vendor</h3>
                    <p>{payment.vendor}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Vendor ID</h3>
                    <p>{payment.vendorId}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Status</h3>
                    <p>
                      <Badge
                        variant={
                          payment.status === "Applied"
                            ? "outline"
                            : payment.status === "Pending"
                              ? "secondary"
                              : "default"
                        }
                        className={payment.status === "Applied" ? "border-green-500 text-green-500" : ""}
                      >
                        {payment.status}
                      </Badge>
                    </p>
                  </div>
                </div>

                {payment.notes && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Notes</h3>
                      <p className="text-sm">{payment.notes}</p>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Download Receipt</Button>
            <div className="flex gap-2">
              {!isFullyAllocated && (
                <Button asChild>
                  <Link href={`/receivables/payments/${payment.id}/allocate`}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Allocate Payment
                  </Link>
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">Payment Date</div>
                </div>
                <div>{payment.date}</div>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-medium">
                <div>Total Amount</div>
                <div>${payment.amount.toFixed(2)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Allocated</div>
                <div className={isFullyAllocated ? "text-green-600" : ""}>${totalAllocated.toFixed(2)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Remaining</div>
                <div className={!isFullyAllocated ? "text-amber-600" : ""}>${remainingToAllocate.toFixed(2)}</div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>Allocation Progress</div>
                <div>{Math.round((totalAllocated / payment.amount) * 100)}%</div>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${isFullyAllocated ? "bg-green-500" : "bg-blue-500"}`}
                  style={{ width: `${Math.min(100, (totalAllocated / payment.amount) * 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
