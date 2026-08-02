"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function CategoryChart({ data }: { data: { category: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E3DACB" vertical={false} />
        <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#5C5348" }} axisLine={{ stroke: "#E3DACB" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#5C5348" }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
          contentStyle={{ fontFamily: "var(--font-inter)", fontSize: 12, border: "1px solid #E3DACB" }}
        />
        <Bar dataKey="revenue" fill="#7C6A57" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
