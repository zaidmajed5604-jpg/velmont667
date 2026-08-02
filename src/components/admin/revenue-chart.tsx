"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E3DACB" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#5C5348" }}
          interval={4}
          axisLine={{ stroke: "#E3DACB" }}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: "#5C5348" }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
          contentStyle={{ fontFamily: "var(--font-inter)", fontSize: 12, border: "1px solid #E3DACB" }}
        />
        <Line type="monotone" dataKey="revenue" stroke="#4A3C30" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
