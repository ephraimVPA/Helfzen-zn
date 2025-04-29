"use client"

import { useMemo } from "react"
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { batches, payments } from "@/app/receivables/data"
import { useIsMobile } from "@/hooks/use-mobile"

interface PaymentTrendsReportProps {
  vendor: string
  groupBy: string
}

export function PaymentTrendsReport({ vendor, groupBy }: PaymentTrendsReportProps) {
  const isMobile = useIsMobile()

  // Generate report data based on filters
  const reportData = useMemo(() => {
    // Filter by vendor if specified
    const filteredBatches = vendor === "all" ? batches : batches.filter((batch) => batch.vendorId === vendor)

    const filteredPayments = vendor === "all" ? payments : payments.filter((payment) => payment.vendorId === vendor)

    // Group data by the specified time period
    const groupedData: Record<
      string,
      {
        billed: number
        paid: number
        paymentRate: number
        avgDaysToPay: number
        invoiceCount: number
        paidInvoiceCount: number
      }
    > = {}

    // Process batches for billed amounts
    filteredBatches.forEach((batch) => {
      const date = new Date(batch.weekEnding)
      let groupKey = ""

      // Determine the group key based on groupBy
      if (groupBy === "day") {
        groupKey = date.toISOString().split("T")[0]
      } else if (groupBy === "week") {
        // Get the week number
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
        groupKey = `${date.getFullYear()}-W${weekNum}`
      } else if (groupBy === "month") {
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      } else if (groupBy === "quarter") {
        const quarter = Math.floor(date.getMonth() / 3) + 1
        groupKey = `${date.getFullYear()}-Q${quarter}`
      } else if (groupBy === "year") {
        groupKey = `${date.getFullYear()}`
      }

      // Initialize group if it doesn't exist
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          billed: 0,
          paid: 0,
          paymentRate: 0,
          avgDaysToPay: 0,
          invoiceCount: 0,
          paidInvoiceCount: 0,
        }
      }

      // Add batch amount to billed total
      groupedData[groupKey].billed += batch.totalAmount
      groupedData[groupKey].invoiceCount += batch.invoices.length

      // Count paid invoices
      const paidInvoices = batch.invoices.filter((invoice) => invoice.status === "Paid")
      groupedData[groupKey].paidInvoiceCount += paidInvoices.length
    })

    // Process payments for paid amounts
    filteredPayments.forEach((payment) => {
      const date = new Date(payment.date)
      let groupKey = ""

      // Determine the group key based on groupBy
      if (groupBy === "day") {
        groupKey = date.toISOString().split("T")[0]
      } else if (groupBy === "week") {
        // Get the week number
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
        groupKey = `${date.getFullYear()}-W${weekNum}`
      } else if (groupBy === "month") {
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      } else if (groupBy === "quarter") {
        const quarter = Math.floor(date.getMonth() / 3) + 1
        groupKey = `${date.getFullYear()}-Q${quarter}`
      } else if (groupBy === "year") {
        groupKey = `${date.getFullYear()}`
      }

      // Initialize group if it doesn't exist
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          billed: 0,
          paid: 0,
          paymentRate: 0,
          avgDaysToPay: 0,
          invoiceCount: 0,
          paidInvoiceCount: 0,
        }
      }

      // Add payment amount to paid total
      groupedData[groupKey].paid += payment.amount

      // Calculate average days to pay (simplified for demo)
      // In a real app, you'd track the actual days between invoice date and payment date
      groupedData[groupKey].avgDaysToPay = Math.floor(Math.random() * 30) + 15 // Random value between 15-45 days
    })

    // Calculate payment rates
    Object.values(groupedData).forEach((data) => {
      data.paymentRate = data.billed > 0 ? (data.paid / data.billed) * 100 : 0
    })

    // Convert to array format for chart
    const chartData = Object.entries(groupedData).map(([key, value]) => {
      // Format the key for display
      let displayKey = key
      if (groupBy === "month") {
        const [year, month] = key.split("-")
        const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
        displayKey = date.toLocaleDateString(undefined, { month: "short", year: "numeric" })
      } else if (groupBy === "quarter") {
        displayKey = key.replace("-", " ")
      }

      return {
        name: displayKey,
        paymentRate: Math.round(value.paymentRate),
        avgDaysToPay: Math.round(value.avgDaysToPay),
        billed: Math.round(value.billed * 100) / 100,
        paid: Math.round(value.paid * 100) / 100,
      }
    })

    // Sort by key
    return chartData.sort((a, b) => a.name.localeCompare(b.name))
  }, [vendor, groupBy])

  // Format the tooltip values
  const formatTooltipValue = (value: number, name: string) => {
    if (name === "paymentRate") {
      return `${value}%`
    } else if (name === "avgDaysToPay") {
      return `${value} days`
    } else {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value)
    }
  }

  return (
    <div className="w-full">
      {reportData.length === 0 ? (
        <div className="flex h-80 items-center justify-center rounded-md border">
          <p className="text-muted-foreground">No data available for the selected filters.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis yAxisId="left" tickFormatter={(value) => `${value}%`} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value} days`} />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="paymentRate"
              name="Payment Rate"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
            <Line yAxisId="right" type="monotone" dataKey="avgDaysToPay" name="Avg. Days to Pay" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
