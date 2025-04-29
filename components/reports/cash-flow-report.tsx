"use client"

import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { batches, payments } from "@/app/receivables/data"
import { useIsMobile } from "@/hooks/use-mobile"

interface CashFlowReportProps {
  vendor: string
  groupBy: string
}

export function CashFlowReport({ vendor, groupBy }: CashFlowReportProps) {
  const isMobile = useIsMobile()

  // Generate report data based on filters
  const reportData = useMemo(() => {
    // Filter by vendor if specified
    const filteredBatches = vendor === "all" ? batches : batches.filter((batch) => batch.vendorId === vendor)

    const filteredPayments = vendor === "all" ? payments : payments.filter((payment) => payment.vendorId === vendor)

    // Group data by the specified time period
    const groupedData: Record<string, { billed: number; paid: number; balance: number }> = {}

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
          balance: 0,
        }
      }

      // Add batch amount to billed total
      groupedData[groupKey].billed += batch.totalAmount
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
          balance: 0,
        }
      }

      // Add payment amount to paid total
      groupedData[groupKey].paid += payment.amount
    })

    // Calculate running balance
    let runningBalance = 0

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

      // Update running balance
      runningBalance += value.billed - value.paid

      return {
        name: displayKey,
        billed: Math.round(value.billed * 100) / 100,
        paid: Math.round(value.paid * 100) / 100,
        balance: Math.round(runningBalance * 100) / 100,
      }
    })

    // Sort by key
    return chartData.sort((a, b) => a.name.localeCompare(b.name))
  }, [vendor, groupBy])

  // Format the tooltip values
  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  return (
    <div className="w-full">
      {reportData.length === 0 ? (
        <div className="flex h-80 items-center justify-center rounded-md border">
          <p className="text-muted-foreground">No data available for the selected filters.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
            <defs>
              <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ffc658" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
            <Area
              type="monotone"
              dataKey="billed"
              name="Billed"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorBilled)"
            />
            <Area type="monotone" dataKey="paid" name="Paid" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPaid)" />
            <Area
              type="monotone"
              dataKey="balance"
              name="Running Balance"
              stroke="#ffc658"
              fillOpacity={1}
              fill="url(#colorBalance)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
