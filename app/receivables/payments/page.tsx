"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentsTable } from "@/components/payments-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { useIsMobile } from "@/hooks/use-mobile"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const isMobile = useIsMobile()

  const handleFilterChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Payments</h1>
          {!isMobile && (
            <p className="text-sm text-muted-foreground">Manage and track incoming payments from vendors</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
          <DateRangePicker />
          <Button asChild className="w-full sm:w-auto">
            <Link href="/receivables/payments/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              Record Payment
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        {!isMobile && (
          <CardHeader>
            <CardTitle>Payment Management</CardTitle>
            <CardDescription>View, allocate, and manage payments from vendors</CardDescription>
          </CardHeader>
        )}
        <CardContent className={isMobile ? "px-3 pt-3" : ""}>
          <div className="overflow-x-auto">
            {isMobile ? (
              <div className="space-y-4">
                <Select value={activeTab} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter payments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending Allocation</SelectItem>
                    <SelectItem value="partial">Partially Allocated</SelectItem>
                    <SelectItem value="applied">Fully Applied</SelectItem>
                  </SelectContent>
                </Select>

                <div className="mt-4">
                  {activeTab === "all" && <PaymentsTable filter="all" />}
                  {activeTab === "pending" && <PaymentsTable filter="pending" />}
                  {activeTab === "partial" && <PaymentsTable filter="partial" />}
                  {activeTab === "applied" && <PaymentsTable filter="applied" />}
                </div>
              </div>
            ) : (
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All Payments</TabsTrigger>
                  <TabsTrigger value="pending">Pending Allocation</TabsTrigger>
                  <TabsTrigger value="partial">Partially Allocated</TabsTrigger>
                  <TabsTrigger value="applied">Fully Applied</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <PaymentsTable filter="all" />
                </TabsContent>
                <TabsContent value="pending">
                  <PaymentsTable filter="pending" />
                </TabsContent>
                <TabsContent value="partial">
                  <PaymentsTable filter="partial" />
                </TabsContent>
                <TabsContent value="applied">
                  <PaymentsTable filter="applied" />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
