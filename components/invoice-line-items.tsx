"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent } from "@/components/ui/card"

// Mock data for line items
const mockLineItems = [
  {
    id: "1",
    description: "Regular Hours",
    quantity: 8,
    rate: 45,
    amount: 360,
  },
  {
    id: "2",
    description: "Overtime Hours",
    quantity: 2,
    rate: 67.5,
    amount: 135,
  },
  {
    id: "3",
    description: "Weekend Differential",
    quantity: 8,
    rate: 5,
    amount: 40,
  },
]

export function InvoiceLineItems({ invoiceId }: { invoiceId: string }) {
  const isMobile = useIsMobile()

  // In a real app, you would fetch line items based on the invoiceId
  const lineItems = mockLineItems

  if (isMobile) {
    return (
      <div className="space-y-4">
        {lineItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="font-medium mb-2">{item.description}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Quantity</div>
                  <div>{item.quantity}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Rate</div>
                  <div>${item.rate.toFixed(2)}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground">Amount</div>
                  <div className="font-medium">${item.amount.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <div className="flex justify-between items-center p-4 border-t">
          <div className="font-medium">Total</div>
          <div className="font-bold">${lineItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="table-container custom-scrollbar">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Rate</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.description}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">${item.rate.toFixed(2)}</TableCell>
              <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={3} className="text-right font-medium">
              Total
            </TableCell>
            <TableCell className="text-right font-bold">
              ${lineItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
