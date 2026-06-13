'use client'

import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface BarChartProps {
  data: Record<string, string | number>[]
  bars: { dataKey: string; color: string; label: string }[]
  xKey?: string
  currency?: string
  height?: number
}

export function BarChart({ data, bars, xKey = 'week', currency, height = 200 }: BarChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-sm text-gray-400 dark:text-gray-500" style={{ height }}>
        No data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'rgb(156,163,175)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'rgb(156,163,175)' }} axisLine={false} tickLine={false} width={36} />
        <Tooltip
          formatter={(value: number, name: string) => [
            currency ? formatCurrency(value, currency) : value,
            bars.find(b => b.dataKey === name)?.label ?? name,
          ]}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: '12px' }}
        />
        {bars.length > 1 && <Legend iconType="circle" iconSize={8} />}
        {bars.map(b => (
          <Bar key={b.dataKey} dataKey={b.dataKey} fill={b.color} radius={[4, 4, 0, 0]} maxBarSize={40} />
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  )
}
