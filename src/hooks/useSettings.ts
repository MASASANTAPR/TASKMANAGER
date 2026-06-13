'use client'

import { useLocalStorage } from './useLocalStorage'
import { DEFAULT_SETTINGS } from '@/lib/constants'
import type { Settings } from '@/lib/types'

// TODO: Replace localStorage with a user-specific backend store when auth is added

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<Settings>('mp_settings', DEFAULT_SETTINGS)

  function updateSettings(partial: Partial<Settings>) {
    setSettings(prev => ({ ...prev, ...partial }))
  }

  function resetAllData() {
    const keys = ['mp_transactions', 'mp_workouts', 'mp_tasks', 'mp_goals', 'mp_settings']
    keys.forEach(k => {
      try { localStorage.removeItem(k) } catch { /* noop */ }
    })
    setSettings(DEFAULT_SETTINGS)
  }

  return { settings, updateSettings, resetAllData }
}
