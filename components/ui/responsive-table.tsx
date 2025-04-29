"use client"

import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent } from "@/components/ui/card"

interface Column {
  key: string
  header: string
  cell?: (item: any) => React.ReactNode
  className?: string
}

interface ResponsiveTableProps {
  data: any[]
  columns: Column[]
  emptyMessage?: string
}

export function ResponsiveTable({ data, columns, emptyMessage = "No data available" }: ResponsiveTableProps) {
  const isMobile = useIsMobile()

  if (data.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              {columns.map((column) => (
                <div key={column.key} className="flex justify-between py-2 border-b last:border-0">
                  <span className="font-medium">{column.header}</span>
                  <span className="text-right">{column.cell ? column.cell(item) : item[column.key]}</span>
                </div>
              ))}
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
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.cell ? column.cell(item) : item[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
