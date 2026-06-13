'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, DollarSign, Dumbbell, CheckSquare, Settings } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { getAccentClasses } from '@/lib/utils'
import { cn } from '@/lib/cn'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/finance', label: 'Finance', icon: DollarSign },
  { href: '/fitness', label: 'Fitness', icon: Dumbbell },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { settings } = useSettings()
  const accent = getAccentClasses(settings.accentColor)

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-30 py-6 px-3">
      <div className="px-3 mb-8">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">My Progress</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{settings.userName}</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? cn(accent.bgLight, accent.text)
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400 dark:text-gray-500">v0.1.0 · Offline</p>
      </div>
    </aside>
  )
}
