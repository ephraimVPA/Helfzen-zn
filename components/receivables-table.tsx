"use client"

import { useState } from "react"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  flexRender,
} from "@tanstack/react-table"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type Batch, batches } from "@/app/receivables/data"
import { useIsMobile } from "@/hooks/use-mobile"
import { ReceivablesMobileView } from "@/components/receivables-mobile-view"

export function ReceivablesTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const isMobile = useIsMobile()

  const columns: ColumnDef<Batch>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "batchNumber",
      header: "Batch #",
      cell: ({ row }) => {
        return <TableCellViewer item={row.original} />
      },
      enableHiding: false,
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
            Total Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        try {
          const amount = Number.parseFloat(row.getValue("totalAmount"))
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
      accessorKey: "paidAmount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-right"
          >
            Paid Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        try {
          const amount = Number.parseFloat(row.getValue("paidAmount"))
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
        const status = row.getValue("status") as string

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
      accessorKey: "invoices",
      header: "Invoices",
      cell: ({ row }) => {
        const invoices = row.original.invoices || []
        return <div className="text-center">{invoices.length}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const batch = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
              >
                <MoreHorizontal />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem>
                <Link href={`/receivables/batch/${batch.id}`} className="w-full">
                  View details
                </Link>
              </DropdownMenuItem>
              {batch.status === "Overdue" && <DropdownMenuItem>Send reminder</DropdownMenuItem>}
              {batch.status !== "Paid" && <DropdownMenuItem>Mark as paid</DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem>Download PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: batches,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Use mobile optimized table on small screens
  const filteredBatches = batches.filter((batch) => {
    return columns.every((column) => {
      if (!column.accessorKey) return true
      const filterValue = columnFilters.find((filter) => filter.id === column.accessorKey)?.value
      if (!filterValue) return true

      const cellValue = batch[column.accessorKey as keyof Batch]
      if (typeof cellValue === "string") {
        return cellValue.toLowerCase().includes((filterValue as string).toLowerCase())
      }
      return true
    })
  })

  // Mobile view
  if (isMobile) {
    return (
      <div>
        <ReceivablesMobileView
          data={filteredBatches}
          onRowSelect={(id, checked) => {
            // Handle row selection if needed
          }}
        />

        <div className="flex items-center justify-between space-x-2 py-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              /* Handle pagination */
            }}
            disabled={true}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              /* Handle pagination */
            }}
            disabled={true}
          >
            Next
          </Button>
        </div>
      </div>
    )
  }

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
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm">
            Export Selected
          </Button>
          {table.getFilteredSelectedRowModel().rows.some((row) => row.original.status === "Overdue") && (
            <Button variant="default" size="sm">
              Send Reminders
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function TableCellViewer({ item }: { item: Batch }) {
  return (
    <Link href={`/receivables/batch/${item.id}`} className="font-medium text-blue-600 hover:underline">
      {item.batchNumber || "Unknown"}
    </Link>
  )
}
