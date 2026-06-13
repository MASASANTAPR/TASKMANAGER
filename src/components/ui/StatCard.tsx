import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from './Card'
import { cn } from '@/lib/cn'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: number
  trendLabel?: string
  iconClassName?: string
  className?: string
  onClick?: () => void
}

export function StatCard({ icon: Icon, label, value, trend, trendLabel, iconClassName, className, onClick }: StatCardProps) {
  const isPositive = (trend ?? 0) >= 0

  return (
    <Card
      className={cn('flex flex-col gap-3', onClick && 'cursor-pointer hover:shadow-md transition-shadow', className)}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800', iconClassName)}>
          <Icon className="w-4 h-4" />
        </div>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white leading-none">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        {trendLabel && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{trendLabel}</p>}
      </div>
    </Card>
  )
}
