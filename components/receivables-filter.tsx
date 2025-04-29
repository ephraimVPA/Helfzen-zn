"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ReceivablesFilter() {
  const [status, setStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search batches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="flex gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="partially-paid">Partially Paid</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by vendor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            <SelectItem value="memorial">Memorial Hospital</SelectItem>
            <SelectItem value="city">City Medical Center</SelectItem>
            <SelectItem value="riverside">Riverside Clinic</SelectItem>
            <SelectItem value="lakeside">Lakeside Medical</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">Reset</Button>
      </div>
    </div>
  )
}
