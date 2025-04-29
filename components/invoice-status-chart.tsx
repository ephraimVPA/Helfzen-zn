"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"

const data = [
  { name: "Paid", value: 65, color: "#16a34a" },
  { name: "Overdue", value: 15, color: "#dc2626" },
  { name: "Pending", value: 12, color: "#f59e0b" },
  { name: "Partially Paid", value: 8, color: "#3b82f6" },
]

export function InvoiceStatusChart() {
  const isMobile = useIsMobile()

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={isMobile ? 80 : 120}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} invoices`, "Count"]} contentStyle={{ borderRadius: "8px" }} />
        <Legend
          layout={isMobile ? "horizontal" : "vertical"}
          align={isMobile ? "center" : "right"}
          verticalAlign={isMobile ? "bottom" : "middle"}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
