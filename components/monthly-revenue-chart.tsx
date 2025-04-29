"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { month: "Jan", billed: 65000, collected: 58000 },
  { month: "Feb", billed: 72000, collected: 63000 },
  { month: "Mar", billed: 68000, collected: 61000 },
  { month: "Apr", billed: 75000, collected: 67000 },
  { month: "May", billed: 82000, collected: 72000 },
  { month: "Jun", billed: 87000, collected: 64000 },
]

export function MonthlyRevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} contentStyle={{ borderRadius: "8px" }} />
        <Area
          type="monotone"
          dataKey="billed"
          name="Amount Billed"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorBilled)"
        />
        <Area
          type="monotone"
          dataKey="collected"
          name="Amount Collected"
          stroke="#16a34a"
          fillOpacity={1}
          fill="url(#colorCollected)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
