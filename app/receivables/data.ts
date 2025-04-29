// Types for the receivables data model
export type Invoice = {
  id: string
  number: string
  amount: number
  status: "Paid" | "Overdue" | "Pending" | "Partially Paid"
  dueDate: string
  issueDate: string
  nurseId: string
  nurseName: string
  shift: "Day" | "Night" | "Evening"
  hours: number
  rate: number
  paidAmount?: number // Added for tracking partial payments
}

export type Batch = {
  id: string
  batchNumber: string
  vendor: string
  vendorId: string
  weekEnding: string
  status: "Submitted" | "Partially Paid" | "Paid" | "Overdue"
  totalAmount: number
  paidAmount: number
  invoices: Invoice[]
}

// New type for payments
export type Payment = {
  id: string
  vendor: string
  vendorId: string
  amount: number
  date: string
  reference: string
  notes?: string
  status: "Pending" | "Applied" | "Partially Applied"
  allocations: PaymentAllocation[]
}

// New type for payment allocations
export type PaymentAllocation = {
  id: string
  paymentId: string
  invoiceId?: string
  batchId?: string
  amount: number
  date: string
  notes?: string
}

// Sample data for batches
export const batches: Batch[] = [
  {
    id: "1",
    batchNumber: "B-2023-W42",
    vendor: "Memorial Hospital",
    vendorId: "MH001",
    weekEnding: "2023-10-15",
    status: "Overdue",
    totalAmount: 12450.75,
    paidAmount: 0,
    invoices: [
      {
        id: "1-1",
        number: "INV-2023-001",
        amount: 4250.75,
        status: "Overdue",
        dueDate: "2023-11-15",
        issueDate: "2023-10-15",
        nurseId: "N001",
        nurseName: "Sarah Johnson",
        shift: "Day",
        hours: 40,
        rate: 75.5,
      },
      {
        id: "1-2",
        number: "INV-2023-002",
        amount: 3800.0,
        status: "Overdue",
        dueDate: "2023-11-15",
        issueDate: "2023-10-15",
        nurseId: "N002",
        nurseName: "Michael Chen",
        shift: "Night",
        hours: 36,
        rate: 85.25,
      },
      {
        id: "1-3",
        number: "INV-2023-003",
        amount: 4400.0,
        status: "Overdue",
        dueDate: "2023-11-15",
        issueDate: "2023-10-15",
        nurseId: "N003",
        nurseName: "Emily Rodriguez",
        shift: "Evening",
        hours: 40,
        rate: 80.0,
      },
    ],
  },
  {
    id: "2",
    batchNumber: "B-2023-W43",
    vendor: "City Medical Center",
    vendorId: "CMC002",
    weekEnding: "2023-10-22",
    status: "Partially Paid",
    totalAmount: 10240.5,
    paidAmount: 5120.25,
    invoices: [
      {
        id: "2-1",
        number: "INV-2023-004",
        amount: 3120.5,
        status: "Paid",
        dueDate: "2023-11-20",
        issueDate: "2023-10-20",
        nurseId: "N001",
        nurseName: "Sarah Johnson",
        shift: "Day",
        hours: 40,
        rate: 75.5,
        paidAmount: 3120.5,
      },
      {
        id: "2-2",
        number: "INV-2023-005",
        amount: 3400.0,
        status: "Pending",
        dueDate: "2023-11-20",
        issueDate: "2023-10-20",
        nurseId: "N004",
        nurseName: "David Kim",
        shift: "Night",
        hours: 32,
        rate: 85.25,
        paidAmount: 0,
      },
      {
        id: "2-3",
        number: "INV-2023-006",
        amount: 3720.0,
        status: "Partially Paid",
        dueDate: "2023-11-20",
        issueDate: "2023-10-20",
        nurseId: "N005",
        nurseName: "Jessica Martinez",
        shift: "Evening",
        hours: 36,
        rate: 80.0,
        paidAmount: 2000.0,
      },
    ],
  },
  {
    id: "3",
    batchNumber: "B-2023-W44",
    vendor: "Riverside Clinic",
    vendorId: "RC003",
    weekEnding: "2023-10-29",
    status: "Paid",
    totalAmount: 8975.25,
    paidAmount: 8975.25,
    invoices: [
      {
        id: "3-1",
        number: "INV-2023-007",
        amount: 3020.0,
        status: "Paid",
        dueDate: "2023-11-28",
        issueDate: "2023-10-28",
        nurseId: "N002",
        nurseName: "Michael Chen",
        shift: "Day",
        hours: 40,
        rate: 75.5,
        paidAmount: 3020.0,
      },
      {
        id: "3-2",
        number: "INV-2023-008",
        amount: 2975.25,
        status: "Paid",
        dueDate: "2023-11-28",
        issueDate: "2023-10-28",
        nurseId: "N003",
        nurseName: "Emily Rodriguez",
        shift: "Night",
        hours: 35,
        rate: 85.25,
        paidAmount: 2975.25,
      },
      {
        id: "3-3",
        number: "INV-2023-009",
        amount: 2980.0,
        status: "Paid",
        dueDate: "2023-11-28",
        issueDate: "2023-10-28",
        nurseId: "N006",
        nurseName: "Robert Wilson",
        shift: "Evening",
        hours: 40,
        rate: 80.0,
        paidAmount: 2980.0,
      },
    ],
  },
  {
    id: "4",
    batchNumber: "B-2023-W45",
    vendor: "Memorial Hospital",
    vendorId: "MH001",
    weekEnding: "2023-11-05",
    status: "Submitted",
    totalAmount: 11340.0,
    paidAmount: 0,
    invoices: [
      {
        id: "4-1",
        number: "INV-2023-010",
        amount: 3775.0,
        status: "Pending",
        dueDate: "2023-12-05",
        issueDate: "2023-11-05",
        nurseId: "N001",
        nurseName: "Sarah Johnson",
        shift: "Day",
        hours: 40,
        rate: 75.5,
      },
      {
        id: "4-2",
        number: "INV-2023-011",
        amount: 3845.0,
        status: "Pending",
        dueDate: "2023-12-05",
        issueDate: "2023-11-05",
        nurseId: "N002",
        nurseName: "Michael Chen",
        shift: "Night",
        hours: 36,
        rate: 85.25,
      },
      {
        id: "4-3",
        number: "INV-2023-012",
        amount: 3720.0,
        status: "Pending",
        dueDate: "2023-12-05",
        issueDate: "2023-11-05",
        nurseId: "N003",
        nurseName: "Emily Rodriguez",
        shift: "Evening",
        hours: 40,
        rate: 80.0,
      },
    ],
  },
  {
    id: "5",
    batchNumber: "B-2023-W46",
    vendor: "Lakeside Medical",
    vendorId: "LM004",
    weekEnding: "2023-11-12",
    status: "Submitted",
    totalAmount: 9980.75,
    paidAmount: 0,
    invoices: [
      {
        id: "5-1",
        number: "INV-2023-013",
        amount: 3020.0,
        status: "Pending",
        dueDate: "2023-12-12",
        issueDate: "2023-11-12",
        nurseId: "N004",
        nurseName: "David Kim",
        shift: "Day",
        hours: 40,
        rate: 75.5,
      },
      {
        id: "5-2",
        number: "INV-2023-014",
        amount: 2980.75,
        status: "Pending",
        dueDate: "2023-12-12",
        issueDate: "2023-11-12",
        nurseId: "N005",
        nurseName: "Jessica Martinez",
        shift: "Night",
        hours: 35,
        rate: 85.25,
      },
      {
        id: "5-3",
        number: "INV-2023-015",
        amount: 3980.0,
        status: "Pending",
        dueDate: "2023-12-12",
        issueDate: "2023-11-12",
        nurseId: "N006",
        nurseName: "Robert Wilson",
        shift: "Evening",
        hours: 40,
        rate: 80.0,
      },
    ],
  },
]

// Sample data for payments
export const payments: Payment[] = [
  {
    id: "p1",
    vendor: "Memorial Hospital",
    vendorId: "MH001",
    amount: 5000.0,
    date: "2023-11-25",
    reference: "CHK12345",
    notes: "Partial payment for October invoices",
    status: "Partially Applied",
    allocations: [
      {
        id: "a1",
        paymentId: "p1",
        invoiceId: "1-1",
        amount: 3000.0,
        date: "2023-11-25",
        notes: "Partial payment",
      },
      {
        id: "a2",
        paymentId: "p1",
        invoiceId: "1-2",
        amount: 2000.0,
        date: "2023-11-25",
        notes: "Partial payment",
      },
    ],
  },
  {
    id: "p2",
    vendor: "City Medical Center",
    vendorId: "CMC002",
    amount: 5120.25,
    date: "2023-11-15",
    reference: "WIRE98765",
    notes: "Payment for batch B-2023-W43",
    status: "Applied",
    allocations: [
      {
        id: "a3",
        paymentId: "p2",
        batchId: "2",
        amount: 5120.25,
        date: "2023-11-15",
        notes: "Partial batch payment",
      },
    ],
  },
  {
    id: "p3",
    vendor: "Riverside Clinic",
    vendorId: "RC003",
    amount: 8975.25,
    date: "2023-11-20",
    reference: "ACH54321",
    notes: "Full payment for batch B-2023-W44",
    status: "Applied",
    allocations: [
      {
        id: "a4",
        paymentId: "p3",
        batchId: "3",
        amount: 8975.25,
        date: "2023-11-20",
        notes: "Full batch payment",
      },
    ],
  },
]

// Helper function to get a batch by ID
export function getBatchById(id: string): Batch | undefined {
  return batches.find((batch) => batch.id === id)
}

// Helper function to get an invoice by ID
export function getInvoiceById(batchId: string, invoiceId: string): Invoice | undefined {
  const batch = getBatchById(batchId)
  if (!batch) return undefined
  return batch.invoices.find((invoice) => invoice.id === invoiceId)
}

// Helper function to get a payment by ID
export function getPaymentById(id: string): Payment | undefined {
  return payments.find((payment) => payment.id === id)
}

// Helper function to get all open invoices
export function getOpenInvoices(): Invoice[] {
  const openInvoices: Invoice[] = []

  batches.forEach((batch) => {
    batch.invoices.forEach((invoice) => {
      if (invoice.status !== "Paid") {
        // Add batch info to invoice for display purposes
        const invoiceWithBatch = {
          ...invoice,
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          vendor: batch.vendor,
          vendorId: batch.vendorId,
        }
        openInvoices.push(invoiceWithBatch as Invoice)
      }
    })
  })

  return openInvoices
}

// Helper function to get all invoices for a vendor
export function getInvoicesByVendor(vendorId: string): Invoice[] {
  const vendorInvoices: Invoice[] = []

  batches.forEach((batch) => {
    if (batch.vendorId === vendorId) {
      batch.invoices.forEach((invoice) => {
        // Add batch info to invoice for display purposes
        const invoiceWithBatch = {
          ...invoice,
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          vendor: batch.vendor,
          vendorId: batch.vendorId,
        }
        vendorInvoices.push(invoiceWithBatch as Invoice)
      })
    }
  })

  return vendorInvoices
}
