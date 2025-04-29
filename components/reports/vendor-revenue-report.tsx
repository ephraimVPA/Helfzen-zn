"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { batches, payments } from "@/app/receivables/data"
import { useIsMobile } from "@/hooks/use-mobile"

interface VendorRevenueReportProps {
  vendor: string
  groupBy: string
}

export function VendorRevenueReport({ vendor, groupBy }: VendorRevenueReportProps) {
  const isMobile = useIsMobile()

  // Generate report data based on filters
  const reportData = useMemo(() => {
    // Filter by vendor if specified
    const filteredBatches = vendor === "all" ? batches : batches.filter((batch) => batch.vendorId === vendor)

    // Group data by the specified time period
    const groupedData: Record<
      string,
      { billed: number; paid: number; vendors: Record<string, { billed: number; paid: number }> }
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
          vendors: {},
        }
      }

      // Initialize vendor in group if it doesn't exist
      if (!groupedData[groupKey].vendors[batch.vendorId]) {
        groupedData[groupKey].vendors[batch.vendorId] = {
          billed: 0,
          paid: 0,
        }
      }

      // Add batch amount to billed total
      groupedData[groupKey].billed += batch.totalAmount
      groupedData[groupKey].vendors[batch.vendorId].billed += batch.totalAmount
    })

    // Process payments for paid amounts
    payments.forEach((payment) => {
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

      // Skip if vendor filter doesn't match
      if (vendor !== "all" && payment.vendorId !== vendor) {
        return
      }

      // Initialize group if it doesn't exist
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          billed: 0,
          paid: 0,
          vendors: {},
        }
      }

      // Initialize vendor in group if it doesn't exist
      if (!groupedData[groupKey].vendors[payment.vendorId]) {
        groupedData[groupKey].vendors[payment.vendorId] = {
          billed: 0,
          paid: 0,
        }
      }

      // Add payment amount to paid total
      groupedData[groupKey].paid += payment.amount
      groupedData[groupKey].vendors[payment.vendorId].paid += payment.amount
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

      // Create data object with vendor breakdown
      const dataObj: any = {
        name: displayKey,
        billed: Math.round(value.billed * 100) / 100,
        paid: Math.round(value.paid * 100) / 100,
      }

      // Add vendor-specific data if we're showing all vendors
      if (vendor === "all") {
        Object.entries(value.vendors).forEach(([vendorId, vendorData]) => {
          const vendorName = batches.find((b) => b.vendorId === vendorId)?.vendor || vendorId
          dataObj[`${vendorName} (Billed)`] = Math.round(vendorData.billed * 100) / 100
          dataObj[`${vendorName} (Paid)`] = Math.round(vendorData.paid * 100) / 100
        })
      }

      return dataObj
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

  // Determine chart height based on data points and mobile status
  const chartHeight = useMemo(() => {
    const baseHeight = isMobile ? 300 : 400
    const minHeight = isMobile ? 300 : 400
    const heightPerItem = 40
    return Math.max(minHeight, baseHeight + (reportData.length > 5 ? (reportData.length - 5) * heightPerItem : 0))
  }, [reportData.length, isMobile])

  return (
    <div className="w-full">
      {reportData.length === 0 ? (
        <div className="flex h-80 items-center justify-center rounded-md border">
          <p className="text-muted-foreground">No data available for the selected filters.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={reportData}
            layout={isMobile ? "vertical" : "horizontal"}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            {isMobile ? (
              <>
                <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                <YAxis type="category" dataKey="name" width={100} />
              </>
            ) : (
              <>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis tickFormatter={(value) => `$${value}`} />
              </>
            )}
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
            {vendor === "all" ? (
              // Show stacked bars for each vendor
              <>
                <Bar dataKey="Memorial Hospital (Billed)" stackId="billed" fill="#8884d8" />
                <Bar dataKey="City Medical Center (Billed)" stackId="billed" fill="#82ca9d" />
                <Bar dataKey="Riverside Clinic (Billed)" stackId="billed" fill="#ffc658" />
                <Bar dataKey="Lakeside Medical (Billed)" stackId="billed" fill="#ff8042" />

                <Bar dataKey="Memorial Hospital (Paid)" stackId="paid" fill="#8884d8" fillOpacity={0.5} />
                <Bar dataKey="City Medical Center (Paid)" stackId="paid" fill="#82ca9d" fillOpacity={0.5} />
                <Bar dataKey="Riverside Clinic (Paid)" stackId="paid" fill="#ffc658" fillOpacity={0.5} />
                <Bar dataKey="Lakeside Medical (Paid)" stackId="paid" fill="#ff8042" fillOpacity={0.5} />
              </>
            ) : (
              // Show billed vs paid for a single vendor
              <>
                <Bar dataKey="billed" fill="#8884d8" name="Billed" />
                <Bar dataKey="paid" fill="#82ca9d" name="Paid" />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
