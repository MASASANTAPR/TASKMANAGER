'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useSettings } from '@/hooks/useSettings'
import type { FinancialGoal } from '@/lib/types'

interface GoalFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<FinancialGoal, 'id'>) => void
  initial?: FinancialGoal
}

const EMPTY = {
  name: '',
  targetAmount: '',
  currentAmount: '',
  deadline: '',
  category: '',
}

export function GoalForm({ open, onClose, onSave, initial }: GoalFormProps) {
  const { settings } = useSettings()
  const [form, setForm] = useState(() => initial
    ? { ...initial, targetAmount: String(initial.targetAmount), currentAmount: String(initial.currentAmount) }
    : EMPTY
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Goal name is required'
    if (!form.targetAmount || Number(form.targetAmount) <= 0) e.targetAmount = 'Enter a valid target amount'
    if (form.currentAmount && isNaN(Number(form.currentAmount))) e.currentAmount = 'Enter a valid amount'
    if (!form.category) e.category = 'Select a category'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSave({
      name: form.name.trim(),
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount) || 0,
      deadline: form.deadline || undefined,
      category: form.category,
    })
    setForm(EMPTY)
    onClose()
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'
  const labelCls = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1'

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Goal' : 'Add Financial Goal'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Goal Name *</label>
          <input type="text" placeholder="e.g. Emergency Fund" className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} />
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Target Amount *</label>
            <input type="number" min="0" step="0.01" placeholder="0.00" className={inputCls} value={form.targetAmount} onChange={e => set('targetAmount', e.target.value)} />
            {errors.targetAmount && <p className="text-xs text-rose-500 mt-1">{errors.targetAmount}</p>}
          </div>
          <div>
            <label className={labelCls}>Current Amount</label>
            <input type="number" min="0" step="0.01" placeholder="0.00" className={inputCls} value={form.currentAmount} onChange={e => set('currentAmount', e.target.value)} />
            {errors.currentAmount && <p className="text-xs text-rose-500 mt-1">{errors.currentAmount}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Category *</label>
            <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select category</option>
              {settings.financeCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className={labelCls}>Deadline</label>
            <input type="date" className={inputCls} value={form.deadline} onChange={e => set('deadline', e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
            {initial ? 'Save Changes' : 'Add Goal'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
