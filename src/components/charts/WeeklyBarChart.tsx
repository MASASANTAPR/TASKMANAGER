'use client'

import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useSettings } from '@/hooks/useSettings'
import { getAccentClasses } from '@/lib/utils'

interface WeeklyBarChartProps {
  data: { day: string; value: number }[]
  height?: number
  label?: string
}

export function WeeklyBarChart({ data, height = 160, label = 'count' }: WeeklyBarChartProps) {
  const { settings } = useSettings()
  const accent = getAccentClasses(settings.accentColor)

  if (!data.length || data.every(d => d.value === 0)) {
    return (
      <div className="flex items-center justify-center text-sm text-gray-400 dark:text-gray-500" style={{ height }}>
        No data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} barCategoryGap="35%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'rgb(156,163,175)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'rgb(156,163,175)' }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
        <Tooltip
          formatter={(value: number) => [value, label]}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: '12px' }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={36}>
          {data.map((_, i) => (
            <Cell key={i} fill={accent.fill} fillOpacity={0.85} />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  )
}
