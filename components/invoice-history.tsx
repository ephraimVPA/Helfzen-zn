"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent } from "@/components/ui/card"

// Mock data for history
const mockHistory = [
  {
    id: "1",
    date: "2023-06-15",
    action: "Created",
    user: "John Smith",
    notes: "Invoice created and submitted to vendor",
  },
  {
    id: "2",
    date: "2023-06-20",
    action: "Reminder Sent",
    user: "System",
    notes: "Automatic payment reminder sent",
  },
  {
    id: "3",
    date: "2023-06-25",
    action: "Payment Received",
    user: "Jane Doe",
    notes: "Partial payment of $247.50 received",
  },
]

export function InvoiceHistory({ invoiceId }: { invoiceId: string }) {
  const isMobile = useIsMobile()

  // In a real app, you would fetch history based on the invoiceId
  const history = mockHistory

  if (isMobile) {
    return (
      <div className="space-y-4">
        {history.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <Badge variant="outline">{item.action}</Badge>
                <span className="text-sm text-muted-foreground">{item.date}</span>
              </div>
              <div className="text-sm mb-1">
                <span className="font-medium">User:</span> {item.user}
              </div>
              <div className="text-sm break-words">
                <span className="font-medium">Notes:</span> {item.notes}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="table-container custom-scrollbar">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.date}</TableCell>
              <TableCell>
                <Badge variant="outline">{item.action}</Badge>
              </TableCell>
              <TableCell>{item.user}</TableCell>
              <TableCell className="max-w-md break-words">{item.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
