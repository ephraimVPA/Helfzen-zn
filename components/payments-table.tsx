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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { type Payment, payments } from "@/app/receivables/data"
import { useIsMobile } from "@/hooks/use-mobile"
import { PaymentsMobileView } from "@/components/payments-mobile-view"
import { Checkbox } from "@/components/ui/checkbox"

export function PaymentsTable({ filter = "all" }: { filter?: "all" | "pending" | "partial" | "applied" }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const isMobile = useIsMobile()

  // Filter payments based on the selected tab - using useMemo to prevent unnecessary recalculations
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      if (filter === "all") return true
      if (filter === "pending") return payment.status === "Pending"
      if (filter === "partial") return payment.status === "Partially Applied"
      if (filter === "applied") return payment.status === "Applied"
      return true
    })
  }, [filter])

  const columns: ColumnDef<Payment>[] = [
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
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("date")}</div>,
    },
    {
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }) => (
        <Link href={`/receivables/payments/${row.original.id}`} className="font-medium text-blue-600 hover:underline">
          {row.getValue("reference")}
        </Link>
      ),
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
      accessorKey: "amount",
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
        const amount = Number.parseFloat(row.getValue("amount"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount)

        return <div className="text-right font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string

        return (
          <Badge
            variant={status === "Applied" ? "outline" : status === "Pending" ? "secondary" : "default"}
            className={status === "Applied" ? "border-green-500 text-green-500" : ""}
          >
            {status}
          </Badge>
        )
      },
    },
    {
      id: "allocations",
      header: "Allocations",
      cell: ({ row }) => {
        const allocations = row.original.allocations || []
        const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.amount, 0)
        const totalAmount = row.original.amount
        const percentAllocated = Math.round((totalAllocated / totalAmount) * 100)

        return (
          <div className="flex items-center gap-2">
            <div className="w-full max-w-[100px] h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${percentAllocated === 100 ? "bg-green-500" : "bg-blue-500"}`}
                style={{ width: `${percentAllocated}%` }}
              ></div>
            </div>
            <span className="text-xs">{percentAllocated}%</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const payment = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/receivables/payments/${payment.id}`}>View details</Link>
              </DropdownMenuItem>
              {payment.status !== "Applied" && (
                <DropdownMenuItem asChild>
                  <Link href={`/receivables/payments/${payment.id}/allocate`}>Allocate payment</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>Download receipt</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredPayments,
    columns,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      rowSelection,
    },
  })

  // Mobile view
  if (isMobile) {
    return (
      <div>
        <PaymentsMobileView
          data={filteredPayments}
          onRowSelect={(id, checked) => {
            setRowSelection((prev) => ({
              ...prev,
              [id]: checked,
            }))
          }}
        />

        <div className="flex items-center justify-between space-x-2 py-4 mt-4">
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}
