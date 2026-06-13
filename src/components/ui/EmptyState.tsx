import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useSettings } from '@/hooks/useSettings'
import { getAccentClasses } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  ctaLabel?: string
  onCta?: () => void
  className?: string
}

export function EmptyState({ icon: Icon, title, description, ctaLabel, onCta, className }: EmptyStateProps) {
  const { settings } = useSettings()
  const accent = getAccentClasses(settings.accentColor)

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center px-4', className)}>
      <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-4', accent.bgLight)}>
        <Icon className={cn('w-7 h-7', accent.text)} />
      </div>
      <p className="text-base font-semibold text-gray-800 dark:text-gray-200">{title}</p>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">{description}</p>}
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className={cn('mt-4 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90', accent.bg)}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  )
}
