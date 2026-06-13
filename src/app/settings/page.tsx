'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Plus, Trash2, Sun, Moon, Monitor, Trash } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ConfirmModal } from '@/components/ui/Modal'
import { useSettings } from '@/hooks/useSettings'
import { ACCENT_COLORS, CURRENCY_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/cn'

export default function SettingsPage() {
  const { settings, updateSettings, resetAllData } = useSettings()
  const { setTheme } = useTheme()
  const [confirmReset, setConfirmReset] = useState(false)
  const [newFinanceCategory, setNewFinanceCategory] = useState('')
  const [newTaskCategory, setNewTaskCategory] = useState('')
  const [newWorkoutType, setNewWorkoutType] = useState('')

  function handleThemeChange(t: string) {
    setTheme(t)
    updateSettings({ theme: t as 'light' | 'dark' | 'system' })
  }

  function addCategory(type: 'financeCategories' | 'taskCategories' | 'workoutTypes', value: string, clear: () => void) {
    const trimmed = value.trim()
    if (!trimmed || settings[type].includes(trimmed)) return
    updateSettings({ [type]: [...settings[type], trimmed] })
    clear()
  }

  function removeCategory(type: 'financeCategories' | 'taskCategories' | 'workoutTypes', item: string) {
    updateSettings({ [type]: settings[type].filter(c => c !== item) })
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'
  const labelCls = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1'
  const sectionTitle = 'text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fadeIn">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Preferences</p>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
      </div>

      {/* Profile */}
      <Card className="space-y-4 animate-fadeIn" style={{ animationDelay: '50ms' as never }}>
        <p className={sectionTitle}>Profile</p>
        <div>
          <label className={labelCls}>Your Name</label>
          <input
            type="text"
            className={inputCls}
            value={settings.userName}
            onChange={e => updateSettings({ userName: e.target.value || 'Friend' })}
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className={labelCls}>Currency</label>
          <select className={inputCls} value={settings.currency} onChange={e => updateSettings({ currency: e.target.value })}>
            {CURRENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Default Weight Unit</label>
          <div className="flex gap-2">
            {(['kg', 'lb'] as const).map(u => (
              <button
                key={u}
                onClick={() => updateSettings({ defaultWeightUnit: u })}
                className={cn(
                  'flex-1 py-2 rounded-xl border text-sm font-medium transition-colors',
                  (settings.defaultWeightUnit ?? 'kg') === u
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="space-y-4 animate-fadeIn" style={{ animationDelay: '75ms' as never }}>
        <p className={sectionTitle}>Appearance</p>

        {/* Theme */}
        <div>
          <label className={labelCls}>Theme</label>
          <div className="flex gap-2">
            {([
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor },
            ] as const).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleThemeChange(value)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-colors',
                  settings.theme === value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label className={labelCls}>Accent Color</label>
          <div className="flex gap-3">
            {ACCENT_COLORS.map(color => (
              <button
                key={color.name}
                onClick={() => updateSettings({ accentColor: color.name })}
                title={color.label}
                className={cn(
                  'w-8 h-8 rounded-full transition-transform hover:scale-110',
                  color.bg,
                  settings.accentColor === color.name && 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900 scale-110'
                )}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Goals */}
      <Card className="space-y-4 animate-fadeIn" style={{ animationDelay: '100ms' as never }}>
        <p className={sectionTitle}>Goals</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Monthly Income Goal</label>
            <input
              type="number"
              min="0"
              className={inputCls}
              value={settings.monthlyIncomeGoal}
              onChange={e => updateSettings({ monthlyIncomeGoal: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className={labelCls}>Monthly Savings Goal</label>
            <input
              type="number"
              min="0"
              className={inputCls}
              value={settings.monthlySavingsGoal}
              onChange={e => updateSettings({ monthlySavingsGoal: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className={labelCls}>Weekly Workout Goal</label>
            <input
              type="number"
              min="1"
              max="14"
              className={inputCls}
              value={settings.weeklyWorkoutGoal}
              onChange={e => updateSettings({ weeklyWorkoutGoal: Number(e.target.value) || 1 })}
            />
          </div>
          <div>
            <label className={labelCls}>Weekly Task Goal</label>
            <input
              type="number"
              min="1"
              className={inputCls}
              value={settings.weeklyTaskGoal}
              onChange={e => updateSettings({ weeklyTaskGoal: Number(e.target.value) || 1 })}
            />
          </div>
        </div>
      </Card>

      {/* Finance Categories */}
      <Card className="space-y-3 animate-fadeIn" style={{ animationDelay: '125ms' as never }}>
        <p className={sectionTitle}>Finance Categories</p>
        <div className="flex flex-wrap gap-2">
          {settings.financeCategories.map(c => (
            <span key={c} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300">
              {c}
              <button onClick={() => removeCategory('financeCategories', c)} className="text-gray-400 hover:text-rose-500 transition-colors ml-0.5">
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New category..."
            className={inputCls + ' flex-1'}
            value={newFinanceCategory}
            onChange={e => setNewFinanceCategory(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory('financeCategories', newFinanceCategory, () => setNewFinanceCategory(''))}
          />
          <button
            onClick={() => addCategory('financeCategories', newFinanceCategory, () => setNewFinanceCategory(''))}
            className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Task Categories */}
      <Card className="space-y-3 animate-fadeIn" style={{ animationDelay: '150ms' as never }}>
        <p className={sectionTitle}>Task Categories</p>
        <div className="flex flex-wrap gap-2">
          {settings.taskCategories.map(c => (
            <span key={c} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300">
              {c}
              <button onClick={() => removeCategory('taskCategories', c)} className="text-gray-400 hover:text-rose-500 transition-colors ml-0.5">
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New category..."
            className={inputCls + ' flex-1'}
            value={newTaskCategory}
            onChange={e => setNewTaskCategory(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory('taskCategories', newTaskCategory, () => setNewTaskCategory(''))}
          />
          <button
            onClick={() => addCategory('taskCategories', newTaskCategory, () => setNewTaskCategory(''))}
            className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Workout Types */}
      <Card className="space-y-3 animate-fadeIn" style={{ animationDelay: '175ms' as never }}>
        <p className={sectionTitle}>Workout Types</p>
        <div className="flex flex-wrap gap-2">
          {settings.workoutTypes.map(t => (
            <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300">
              {t}
              <button onClick={() => removeCategory('workoutTypes', t)} className="text-gray-400 hover:text-rose-500 transition-colors ml-0.5">
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New workout type..."
            className={inputCls + ' flex-1'}
            value={newWorkoutType}
            onChange={e => setNewWorkoutType(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory('workoutTypes', newWorkoutType, () => setNewWorkoutType(''))}
          />
          <button
            onClick={() => addCategory('workoutTypes', newWorkoutType, () => setNewWorkoutType(''))}
            className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="space-y-3 animate-fadeIn border-rose-100 dark:border-rose-900/50" style={{ animationDelay: '200ms' as never }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-400">Danger Zone</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Permanently delete all your data including transactions, workouts, and tasks. This cannot be undone.</p>
        <button
          onClick={() => setConfirmReset(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors"
        >
          <Trash className="w-4 h-4" />
          Clear All Data
        </button>
      </Card>

      <ConfirmModal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={resetAllData}
        title="Clear All Data"
        message="This will permanently delete all your transactions, workouts, tasks, goals, and settings. Are you sure?"
      />
    </div>
  )
}
