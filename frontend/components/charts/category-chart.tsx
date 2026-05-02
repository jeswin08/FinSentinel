'use client';

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryChartProps {
  data: { category: string; amount: number; count: number }[];
}

const CATEGORY_COLORS = [
  'oklch(0.55 0.15 200)',
  'oklch(0.65 0.2 145)',
  'oklch(0.75 0.18 85)',
  'oklch(0.6 0.22 25)',
  'oklch(0.6 0.15 250)',
  'oklch(0.7 0.15 320)',
];

export function CategoryChart({ data }: CategoryChartProps) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="flex items-center gap-4">
      <div className="h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(0.16 0.01 260)',
                border: '1px solid oklch(0.28 0.01 260)',
                borderRadius: '8px',
                color: 'oklch(0.95 0 0)',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="amount"
              nameKey="category"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2.5">
        {data.map((item, index) => (
          <div key={item.category} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
              />
              <span className="text-muted-foreground">{item.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-card-foreground">${item.amount.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground/60">
                {total > 0 ? ((item.amount / total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
