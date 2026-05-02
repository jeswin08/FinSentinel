'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface SpendingChartProps {
  data: { month: string; amount: number }[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="oklch(0.65 0 0)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="oklch(0.65 0 0)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `$${(value / 1000).toFixed(1)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.16 0.01 260)',
              border: '1px solid oklch(0.28 0.01 260)',
              borderRadius: '8px',
              color: 'oklch(0.95 0 0)',
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spending']}
          />
          <Bar
            dataKey="amount"
            fill="oklch(0.55 0.15 200)"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
