"use client"

import { useState } from "react"
import { DownloadIcon, FilterIcon, PlusIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { VendorRevenueReport } from "@/components/reports/vendor-revenue-report"
import { CashFlowReport } from "@/components/reports/cash-flow-report"
import { InvoiceAgingReport } from "@/components/reports/invoice-aging-report"
import { PaymentTrendsReport } from "@/components/reports/payment-trends-report"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("vendor-revenue")
  const [vendor, setVendor] = useState("all")
  const [groupBy, setGroupBy] = useState("month")
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Comprehensive financial reports and analytics</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker />
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <FilterIcon className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Report Filters</SheetTitle>
                  <SheetDescription>Customize your report view</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Type</label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vendor-revenue">Revenue by Vendor</SelectItem>
                        <SelectItem value="cash-flow">Cash Flow</SelectItem>
                        <SelectItem value="invoice-aging">Invoice Aging</SelectItem>
                        <SelectItem value="payment-trends">Payment Trends</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vendor</label>
                    <Select value={vendor} onValueChange={setVendor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Vendors</SelectItem>
                        <SelectItem value="MH001">Memorial Hospital</SelectItem>
                        <SelectItem value="CMC002">City Medical Center</SelectItem>
                        <SelectItem value="RC003">Riverside Clinic</SelectItem>
                        <SelectItem value="LM004">Lakeside Medical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Group By</label>
                    <Select value={groupBy} onValueChange={setGroupBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grouping" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="quarter">Quarter</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center gap-2">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendor-revenue">Revenue by Vendor</SelectItem>
                  <SelectItem value="cash-flow">Cash Flow</SelectItem>
                  <SelectItem value="invoice-aging">Invoice Aging</SelectItem>
                  <SelectItem value="payment-trends">Payment Trends</SelectItem>
                </SelectContent>
              </Select>
              <Select value={vendor} onValueChange={setVendor}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  <SelectItem value="MH001">Memorial Hospital</SelectItem>
                  <SelectItem value="CMC002">City Medical Center</SelectItem>
                  <SelectItem value="RC003">Riverside Clinic</SelectItem>
                  <SelectItem value="LM004">Lakeside Medical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Group By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">$42,890.50</CardTitle>
              <Badge variant="outline" className="flex gap-1 text-green-600">
                <TrendingUpIcon className="h-3.5 w-3.5" />
                +12.5%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Compared to previous period</p>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div className="h-2 rounded-full bg-green-500" style={{ width: "65%" }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Outstanding Invoices</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">$23,795.00</CardTitle>
              <Badge variant="outline" className="flex gap-1 text-amber-600">
                <TrendingUpIcon className="h-3.5 w-3.5" />
                +4.2%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Compared to previous period</p>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div className="h-2 rounded-full bg-amber-500" style={{ width: "45%" }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Collection Rate</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">68.4%</CardTitle>
              <Badge variant="outline" className="flex gap-1 text-green-600">
                <TrendingUpIcon className="h-3.5 w-3.5" />
                +2.1%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Compared to previous period</p>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div className="h-2 rounded-full bg-blue-500" style={{ width: "68.4%" }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Days Sales Outstanding</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">32 days</CardTitle>
              <Badge variant="outline" className="flex gap-1 text-red-600">
                <TrendingDownIcon className="h-3.5 w-3.5" />
                -5.3%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Compared to previous period</p>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div className="h-2 rounded-full bg-green-500" style={{ width: "32%" }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="chart">Chart View</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>
                {reportType === "vendor-revenue" && "Revenue by Vendor"}
                {reportType === "cash-flow" && "Cash Flow Analysis"}
                {reportType === "invoice-aging" && "Invoice Aging Report"}
                {reportType === "payment-trends" && "Payment Trends"}
              </CardTitle>
              <CardDescription>
                {reportType === "vendor-revenue" && "Analyze revenue breakdown by vendor"}
                {reportType === "cash-flow" && "Track cash inflows and outflows over time"}
                {reportType === "invoice-aging" && "View outstanding invoices by age"}
                {reportType === "payment-trends" && "Analyze payment patterns and trends"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportType === "vendor-revenue" && <VendorRevenueReport vendor={vendor} groupBy={groupBy} />}
              {reportType === "cash-flow" && <CashFlowReport vendor={vendor} groupBy={groupBy} />}
              {reportType === "invoice-aging" && <InvoiceAgingReport vendor={vendor} />}
              {reportType === "payment-trends" && <PaymentTrendsReport vendor={vendor} groupBy={groupBy} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Year-over-Year Comparison</CardTitle>
                <CardDescription>Compare current year with previous year</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Year-over-year comparison chart will be displayed here</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendor Performance Comparison</CardTitle>
                <CardDescription>Compare performance across vendors</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Vendor performance comparison chart will be displayed here</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue trends over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Revenue trends chart will be displayed here</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collection Efficiency</CardTitle>
                <CardDescription>Trends in collection efficiency over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Collection efficiency chart will be displayed here</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
            <CardDescription>Key metrics and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportType === "vendor-revenue" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">$42,890.50</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Top Vendor</p>
                      <p className="text-2xl font-bold">Memorial Hospital</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium">Revenue Distribution</p>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Memorial Hospital</span>
                        <span className="text-sm font-medium">$23,790.75 (55%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary" style={{ width: "55%" }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">City Medical Center</span>
                        <span className="text-sm font-medium">$10,240.50 (24%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: "24%" }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Riverside Clinic</span>
                        <span className="text-sm font-medium">$8,975.25 (21%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-green-500" style={{ width: "21%" }}></div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {reportType === "cash-flow" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Inflow</p>
                      <p className="text-2xl font-bold text-green-600">$19,095.50</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Outstanding</p>
                      <p className="text-2xl font-bold text-amber-600">$23,795.00</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium">Monthly Trend</p>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">April 2024</span>
                        <span className="text-sm font-medium text-green-600">+$5,120.25</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">May 2024</span>
                        <span className="text-sm font-medium text-green-600">+$8,975.25</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">June 2024</span>
                        <span className="text-sm font-medium text-green-600">+$5,000.00</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {reportType === "invoice-aging" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Outstanding</p>
                      <p className="text-2xl font-bold">$23,795.00</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Overdue</p>
                      <p className="text-2xl font-bold text-destructive">$12,450.75</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium">Aging Breakdown</p>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Current</span>
                        <span className="text-sm font-medium">$11,344.25 (48%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-green-500" style={{ width: "48%" }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">1-30 Days</span>
                        <span className="text-sm font-medium">$0.00 (0%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: "0%" }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">31-60 Days</span>
                        <span className="text-sm font-medium">$0.00 (0%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-amber-500" style={{ width: "0%" }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">60+ Days</span>
                        <span className="text-sm font-medium">$12,450.75 (52%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-destructive" style={{ width: "52%" }}></div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {reportType === "payment-trends" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Days to Pay</p>
                      <p className="text-2xl font-bold">32</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Rate</p>
                      <p className="text-2xl font-bold">45%</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium">Vendor Payment Performance</p>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Memorial Hospital</span>
                        <span className="text-sm font-medium">42 days avg.</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-amber-500" style={{ width: "70%" }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">City Medical Center</span>
                        <span className="text-sm font-medium">25 days avg.</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-green-500" style={{ width: "40%" }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Riverside Clinic</span>
                        <span className="text-sm font-medium">18 days avg.</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: "30%" }}></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Reports</CardTitle>
            <CardDescription>Create and save custom report configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Monthly Revenue by Vendor</h3>
                    <p className="text-sm text-muted-foreground">Last updated: 2 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Run
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Quarterly Cash Flow</h3>
                    <p className="text-sm text-muted-foreground">Last updated: 1 week ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Run
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Overdue Invoices by Vendor</h3>
                    <p className="text-sm text-muted-foreground">Last updated: 3 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Run
                  </Button>
                </div>
              </div>

              <Button className="w-full">
                <PlusIcon className="mr-2 h-4 w-4" />
                Create New Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
