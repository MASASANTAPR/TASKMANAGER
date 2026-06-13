import { cn } from '@/lib/cn'
import { PRIORITY_COLORS, STATUS_COLORS } from '@/lib/constants'

interface BadgeProps {
  type: 'priority' | 'status' | 'intensity'
  value: string
  className?: string
}

export function Badge({ type, value, className }: BadgeProps) {
  let bg = '', text = ''

  if (type === 'priority') {
    const key = value as keyof typeof PRIORITY_COLORS
    bg = PRIORITY_COLORS[key]?.bg ?? 'bg-gray-100'
    text = PRIORITY_COLORS[key]?.text ?? 'text-gray-600'
  } else if (type === 'status') {
    const key = value as keyof typeof STATUS_COLORS
    bg = STATUS_COLORS[key]?.bg ?? 'bg-gray-100'
    text = STATUS_COLORS[key]?.text ?? 'text-gray-600'
  } else if (type === 'intensity') {
    const num = parseInt(value)
    if (num <= 3) { bg = 'bg-emerald-50 dark:bg-emerald-950/50'; text = 'text-emerald-700 dark:text-emerald-400' }
    else if (num <= 6) { bg = 'bg-amber-50 dark:bg-amber-950/50'; text = 'text-amber-700 dark:text-amber-400' }
    else { bg = 'bg-rose-50 dark:bg-rose-950/50'; text = 'text-rose-700 dark:text-rose-400' }
  }

  const label = type === 'intensity' ? `${value}/10` : value.replace('-', ' ')

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize', bg, text, className)}>
      {label}
    </span>
  )
}
