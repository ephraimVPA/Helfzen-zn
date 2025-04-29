"use client"

import { useState, useMemo } from "react"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { batches } from "@/app/receivables/data"

export function RecentInvoicesTable() {
  const [sorting, setSorting] = useState<SortingState>([])

  // Get the 5 most recent batches
  const recentBatches = useMemo(() => {
    try {
      if (!batches || !Array.isArray(batches)) return []

      return [...batches]
        .sort((a, b) => {
          try {
            return new Date(b.weekEnding || "").getTime() - new Date(a.weekEnding || "").getTime()
          } catch (error) {
            return 0
          }
        })
        .slice(0, 5)
    } catch (error) {
      console.error("Error processing batches:", error)
      return []
    }
  }, [])

  const columns: ColumnDef<(typeof recentBatches)[0]>[] = [
    {
      accessorKey: "batchNumber",
      header: "Batch #",
      cell: ({ row }) => {
        const id = row.original?.id
        if (!id) return "Unknown"

        return (
          <Link href={`/receivables/batch/${id}`} className="font-medium text-blue-600 hover:underline">
            {row.original.batchNumber || "Unknown"}
          </Link>
        )
      },
    },
    {
      accessorKey: "vendor",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Vendor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => row.original?.vendor || "Unknown",
    },
    {
      accessorKey: "weekEnding",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Week Ending
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => row.original?.weekEnding || "Unknown",
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-right"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        try {
          const amount = Number.parseFloat(row.getValue("totalAmount") || "0")
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(amount)

          return <div className="text-right font-medium">{formatted}</div>
        } catch (error) {
          return <div className="text-right font-medium">$0.00</div>
        }
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = (row.getValue("status") as string) || "Unknown"

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant={
                    status === "Paid"
                      ? "outline"
                      : status === "Overdue"
                        ? "destructive"
                        : status === "Partially Paid"
                          ? "default"
                          : "outline"
                  }
                  className={status === "Paid" ? "border-green-500 text-green-500" : ""}
                >
                  {status}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {status === "Overdue"
                  ? "Payment is past the due date"
                  : status === "Paid"
                    ? "Payment has been received in full"
                    : status === "Partially Paid"
                      ? "Partial payment has been received"
                      : "Batch has been submitted but not yet paid"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const batch = row.original
        if (!batch?.id) return null

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href={`/receivables/batch/${batch.id}`} className="w-full">
                  View details
                </Link>
              </DropdownMenuItem>
              {batch.status === "Overdue" && <DropdownMenuItem>Send reminder</DropdownMenuItem>}
              {batch.status !== "Paid" && <DropdownMenuItem>Mark as paid</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: recentBatches,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
