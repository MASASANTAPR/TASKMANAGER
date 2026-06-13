'use client'

import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface LineChartProps {
  data: Record<string, string | number>[]
  dataKey: string
  xKey?: string
  color?: string
  currency?: string
  height?: number
  label?: string
}

export function LineChart({ data, dataKey, xKey = 'date', color = '#6366f1', currency, height = 200, label }: LineChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-sm text-gray-400 dark:text-gray-500" style={{ height }}>
        No data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'rgb(156,163,175)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'rgb(156,163,175)' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          formatter={(value: number) => [
            currency ? formatCurrency(value, currency) : value,
            label ?? dataKey,
          ]}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: '12px' }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          dot={{ fill: color, r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </ReLineChart>
    </ResponsiveContainer>
  )
}
