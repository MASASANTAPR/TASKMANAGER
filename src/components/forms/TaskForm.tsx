'use client'

import { useState } from 'react'
import { RepeatIcon } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useSettings } from '@/hooks/useSettings'
import { todayISO } from '@/lib/utils'
import { PRIORITY_COLORS } from '@/lib/constants'
import type { Task, TaskRecurrence } from '@/lib/types'

interface TaskFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Task, 'id' | 'createdAt'>) => void
  initial?: Task
}

// CUSTOMIZE: day labels shown in the day-of-week picker (starts Sunday = 0)
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const EMPTY = {
  title: '',
  description: '',
  date: todayISO(),
  time: '',
  priority: 'medium' as Task['priority'],
  category: '',
  status: 'pending' as Task['status'],
  notes: '',
  recurrenceType: 'once' as TaskRecurrence['type'],
  daysOfWeek: [] as number[],
  endDate: '',
}

export function TaskForm({ open, onClose, onSave, initial }: TaskFormProps) {
  const { settings } = useSettings()
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...(initial ? {
      title: initial.title,
      description: initial.description ?? '',
      date: initial.date,
      time: initial.time ?? '',
      priority: initial.priority,
      category: initial.category,
      status: initial.status,
      notes: initial.notes ?? '',
      recurrenceType: initial.recurrence?.type ?? 'once',
      daysOfWeek: initial.recurrence?.daysOfWeek ?? [],
      endDate: initial.recurrence?.endDate ?? '',
    } : {}),
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  function toggleDay(day: number) {
    setForm(p => {
      const days = p.daysOfWeek.includes(day)
        ? p.daysOfWeek.filter(d => d !== day)
        : [...p.daysOfWeek, day].sort()
      return { ...p, daysOfWeek: days }
    })
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.date) e.date = 'Date is required'
    if (!form.category) e.category = 'Select a category'
    if (form.recurrenceType === 'specific-days' && form.daysOfWeek.length === 0) {
      e.daysOfWeek = 'Select at least one day'
    }
    if (form.recurrenceType === 'until-date' && !form.endDate) {
      e.endDate = 'End date is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const recurrence: TaskRecurrence = { type: form.recurrenceType }
    if (form.recurrenceType === 'specific-days') recurrence.daysOfWeek = form.daysOfWeek
    if (form.recurrenceType === 'until-date') recurrence.endDate = form.endDate

    onSave({
      title: form.title.trim(),
      description: form.description || undefined,
      date: form.date,
      time: form.time || undefined,
      priority: form.priority,
      category: form.category,
      status: form.status,
      notes: form.notes || undefined,
      recurrence,
    })
    setForm(EMPTY)
    onClose()
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'
  const labelCls = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1'

  const isRecurring = form.recurrenceType !== 'once'

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Task' : 'Add Task'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Title *</label>
          <input type="text" placeholder="What needs to be done?" className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} />
          {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea rows={2} placeholder="Optional details..." className={inputCls} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{isRecurring ? 'Start Date *' : 'Date *'}</label>
            <input type="date" className={inputCls} value={form.date} onChange={e => set('date', e.target.value)} />
            {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
          </div>
          <div>
            <label className={labelCls}>Time</label>
            <input type="time" className={inputCls} value={form.time} onChange={e => set('time', e.target.value)} />
          </div>
        </div>

        {/* Recurrence */}
        <div>
          <label className={labelCls + ' flex items-center gap-1.5'}>
            <RepeatIcon className="w-3 h-3" />
            Repeat
          </label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'once', label: 'Just once' },
              { value: 'daily', label: 'Every day' },
              { value: 'specific-days', label: 'Specific days' },
              { value: 'until-date', label: 'Daily until…' },
            ] as const).map(opt => (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors text-xs font-medium ${
                  form.recurrenceType === opt.value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="recurrenceType"
                  value={opt.value}
                  checked={form.recurrenceType === opt.value}
                  onChange={() => setForm(p => ({ ...p, recurrenceType: opt.value }))}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>

          {/* Day-of-week toggles */}
          {form.recurrenceType === 'specific-days' && (
            <div className="mt-2">
              <div className="flex gap-1">
                {DAY_LABELS.map((label, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      form.daysOfWeek.includes(idx)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {errors.daysOfWeek && <p className="text-xs text-rose-500 mt-1">{errors.daysOfWeek}</p>}
            </div>
          )}

          {/* Until-date picker */}
          {form.recurrenceType === 'until-date' && (
            <div className="mt-2">
              <input type="date" className={inputCls} value={form.endDate} onChange={e => set('endDate', e.target.value)} />
              {errors.endDate && <p className="text-xs text-rose-500 mt-1">{errors.endDate}</p>}
            </div>
          )}
        </div>

        <div>
          <label className={labelCls}>Priority</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => set('priority', p)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-colors border ${
                  form.priority === p
                    ? `${PRIORITY_COLORS[p].bg} ${PRIORITY_COLORS[p].text} border-transparent`
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Category *</label>
            <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select category</option>
              {settings.taskCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
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
            {initial ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
