"use client"

import { Suspense } from "react"
import { CalendarIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { InvoiceStatusChart } from "@/components/invoice-status-chart"
import { RecentInvoicesTable } from "@/components/recent-invoices-table"
import { MonthlyRevenueChart } from "@/components/monthly-revenue-chart"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your agency's billing and receivables</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
          <DateRangePicker />
          <Button className="w-full sm:w-auto sm:ml-auto">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">23</div>
            <p className="text-xs text-muted-foreground">+4.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Billed This Month</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$87,432.00</div>
            <p className="text-xs text-muted-foreground">+18.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$64,891.00</div>
            <p className="text-xs text-muted-foreground">+7.4% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue trends over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="chart-container custom-scrollbar">
              <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
                <MonthlyRevenueChart />
              </Suspense>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
            <CardDescription>Breakdown of current invoice statuses</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="chart-container custom-scrollbar">
              <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
                <InvoiceStatusChart />
              </Suspense>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Your most recent invoices and their status</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto sm:ml-auto">
            View All
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="table-container custom-scrollbar">
            <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
              <RecentInvoicesTable />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
