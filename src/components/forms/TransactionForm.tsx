'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useSettings } from '@/hooks/useSettings'
import { todayISO } from '@/lib/utils'
import { PAYMENT_METHODS } from '@/lib/constants'
import type { Transaction } from '@/lib/types'

interface TransactionFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>) => void
  initial?: Transaction
}

const EMPTY = {
  type: 'expense' as const,
  amount: '',
  description: '',
  category: '',
  date: todayISO(),
  paymentMethod: '',
  notes: '',
}

export function TransactionForm({ open, onClose, onSave, initial }: TransactionFormProps) {
  const { settings } = useSettings()
  const [form, setForm] = useState(() => initial
    ? { ...initial, amount: String(initial.amount) }
    : EMPTY
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount'
    if (!form.category) e.category = 'Select a category'
    if (!form.date) e.date = 'Date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSave({
      type: form.type as Transaction['type'],
      amount: Number(form.amount),
      description: form.description.trim(),
      category: form.category,
      date: form.date,
      paymentMethod: form.paymentMethod || undefined,
      notes: form.notes || undefined,
    })
    setForm(EMPTY)
    onClose()
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
  const labelCls = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1'

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Transaction' : 'Add Transaction'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type */}
        <div>
          <label className={labelCls}>Type</label>
          <div className="flex gap-2">
            {(['income', 'expense', 'debt'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-colors border ${
                  form.type === t
                    ? t === 'income' ? 'bg-emerald-600 text-white border-emerald-600' : t === 'expense' ? 'bg-rose-600 text-white border-rose-600' : 'bg-amber-500 text-white border-amber-500'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Amount + Description row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Amount *</label>
            <input type="number" step="0.01" min="0" placeholder="0.00" className={inputCls} value={form.amount} onChange={e => set('amount', e.target.value)} />
            {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
          </div>
          <div>
            <label className={labelCls}>Date *</label>
            <input type="date" className={inputCls} value={form.date} onChange={e => set('date', e.target.value)} />
            {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
          </div>
        </div>

        <div>
          <label className={labelCls}>Description *</label>
          <input type="text" placeholder="What was this for?" className={inputCls} value={form.description} onChange={e => set('description', e.target.value)} />
          {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className={labelCls}>Category *</label>
          <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="">Select category</option>
            {settings.financeCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className={labelCls}>Payment Method</label>
          <select className={inputCls} value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
            <option value="">Select method</option>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Notes</label>
          <textarea rows={2} placeholder="Optional notes..." className={inputCls} value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
            {initial ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
