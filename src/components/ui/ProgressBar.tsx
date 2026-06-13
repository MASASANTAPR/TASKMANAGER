'use client'

import { useSettings } from '@/hooks/useSettings'
import { getAccentClasses } from '@/lib/utils'
import { cn } from '@/lib/cn'

interface ProgressBarProps {
  value: number // 0–100
  label?: string
  showPercent?: boolean
  size?: 'sm' | 'md'
  color?: string
  className?: string
}

export function ProgressBar({ value, label, showPercent = false, size = 'sm', color, className }: ProgressBarProps) {
  const { settings } = useSettings()
  const accent = getAccentClasses(color ?? settings.accentColor)
  const height = size === 'md' ? 'h-3' : 'h-2'
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('space-y-1', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>}
          {showPercent && <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{clamped}%</span>}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-gray-100 dark:bg-gray-800', height)}>
        <div
          className={cn('rounded-full transition-all duration-700 ease-out', height, accent.bg)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
