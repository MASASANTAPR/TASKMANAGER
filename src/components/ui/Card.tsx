import { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

export function Card({ className, padding = 'md', children, ...props }: CardProps) {
  const paddingClass = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }[padding]

  return (
    <div
      className={cn(
        'rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
        paddingClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
