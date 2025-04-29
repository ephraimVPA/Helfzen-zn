"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DateRangePicker({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  })
  const [preset, setPreset] = React.useState<string>("this-month")

  const handlePresetChange = (value: string) => {
    setPreset(value)

    const today = new Date()

    switch (value) {
      case "today":
        setDate({ from: today, to: today })
        break
      case "yesterday":
        const yesterday = addDays(today, -1)
        setDate({ from: yesterday, to: yesterday })
        break
      case "this-week":
        const thisWeekStart = new Date(today)
        thisWeekStart.setDate(today.getDate() - today.getDay())
        const thisWeekEnd = addDays(thisWeekStart, 6)
        setDate({ from: thisWeekStart, to: thisWeekEnd })
        break
      case "last-week":
        const lastWeekStart = addDays(new Date(today), -7 - today.getDay())
        const lastWeekEnd = addDays(lastWeekStart, 6)
        setDate({ from: lastWeekStart, to: lastWeekEnd })
        break
      case "this-month":
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        setDate({ from: thisMonthStart, to: thisMonthEnd })
        break
      case "last-month":
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
        setDate({ from: lastMonthStart, to: lastMonthEnd })
        break
      case "last-30-days":
        setDate({ from: addDays(today, -30), to: today })
        break
      case "last-90-days":
        setDate({ from: addDays(today, -90), to: today })
        break
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full sm:w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex items-center gap-2 p-3">
            <Select value={preset} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select a preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="last-week">Last Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="p-3">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={1}
              className="rounded-md border"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
