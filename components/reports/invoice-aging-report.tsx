"use client"

import { useMemo } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

import { batches } from "@/app/receivables/data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/hooks/use-mobile"

interface InvoiceAgingReportProps {
  vendor: string
}

export function InvoiceAgingReport({ vendor }: InvoiceAgingReportProps) {
  const isMobile = useIsMobile()

  // Generate report data based on filters
  const { chartData, tableData } = useMemo(() => {
    // Filter by vendor if specified
    const filteredBatches = vendor === "all" ? batches : batches.filter((batch) => batch.vendorId === vendor)

    // Collect all invoices
    const allInvoices = filteredBatches.flatMap((batch) =>
      batch.invoices.map((invoice) => ({
        ...invoice,
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        vendor: batch.vendor,
        vendorId: batch.vendorId,
      })),
    )

    // Filter out paid invoices
    const unpaidInvoices = allInvoices.filter((invoice) => invoice.status !== "Paid")

    // Calculate age for each invoice
    const today = new Date()
    const invoicesWithAge = unpaidInvoices.map((invoice) => {
      const dueDate = new Date(invoice.dueDate)
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

      let ageCategory = "Current"
      if (daysOverdue > 0) {
        if (daysOverdue <= 30) {
          ageCategory = "1-30 Days"
        } else if (daysOverdue <= 60) {
          ageCategory = "31-60 Days"
        } else {
          ageCategory = "60+ Days"
        }
      }

      return {
        ...invoice,
        daysOverdue: Math.max(0, daysOverdue),
        ageCategory,
      }
    })

    // Group by age category
    const agingGroups: Record<string, { count: number; amount: number; invoices: typeof invoicesWithAge }> = {
      Current: { count: 0, amount: 0, invoices: [] },
      "1-30 Days": { count: 0, amount: 0, invoices: [] },
      "31-60 Days": { count: 0, amount: 0, invoices: [] },
      "60+ Days": { count: 0, amount: 0, invoices: [] },
    }

    invoicesWithAge.forEach((invoice) => {
      const group = agingGroups[invoice.ageCategory]
      group.count++

      // For partially paid invoices, use the remaining amount
      const remainingAmount =
        invoice.status === "Partially Paid" && invoice.paidAmount ? invoice.amount - invoice.paidAmount : invoice.amount

      group.amount += remainingAmount
      group.invoices.push(invoice)
    })

    // Prepare chart data
    const chartData = Object.entries(agingGroups).map(([name, data]) => ({
      name,
      value: data.amount,
      count: data.count,
    }))

    // Prepare table data
    const tableData = invoicesWithAge.sort((a, b) => b.daysOverdue - a.daysOverdue)

    return { chartData, tableData }
  }, [vendor])

  // Colors for the pie chart
  const COLORS = ["#4caf50", "#2196f3", "#ff9800", "#f44336"]

  // Format the tooltip values
  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {chartData.every((item) => item.value === 0) ? (
        <div className="flex h-80 items-center justify-center rounded-md border">
          <p className="text-muted-foreground">No outstanding invoices for the selected filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={isMobile ? 80 : 120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatTooltipValue(value)}
                  contentStyle={{ borderRadius: "8px" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <div className="space-y-4">
              {chartData.map((category, index) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span>{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatTooltipValue(category.value)}</div>
                      <div className="text-xs text-muted-foreground">{category.count} invoices</div>
                    </div>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                        width: `${(category.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Days Overdue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.length > 0 ? (
              tableData.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.number}</TableCell>
                  <TableCell>{invoice.vendor}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>
                    {invoice.daysOverdue > 0 ? (
                      <span className="text-destructive">{invoice.daysOverdue}</span>
                    ) : (
                      <span>0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === "Overdue"
                          ? "destructive"
                          : invoice.status === "Partially Paid"
                            ? "default"
                            : "outline"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.status === "Partially Paid" && invoice.paidAmount ? (
                      <div>
                        <div>${(invoice.amount - invoice.paidAmount).toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">of ${invoice.amount.toFixed(2)}</div>
                      </div>
                    ) : (
                      <div>${invoice.amount.toFixed(2)}</div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No outstanding invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
