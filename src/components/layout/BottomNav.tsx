'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, DollarSign, Dumbbell, CheckSquare, Settings } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { getAccentClasses } from '@/lib/utils'
import { cn } from '@/lib/cn'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/finance', label: 'Finance', icon: DollarSign },
  { href: '/fitness', label: 'Fitness', icon: Dumbbell },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  const { settings } = useSettings()
  const accent = getAccentClasses(settings.accentColor)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-16 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800 flex items-center px-2 safe-bottom">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 gap-0.5 py-2 rounded-xl transition-colors',
              isActive ? accent.text : 'text-gray-400 dark:text-gray-500'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
