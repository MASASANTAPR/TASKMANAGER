'use client'

import { useState } from 'react'
import { Plus, CheckCircle2, Circle, Pencil, Trash2, CheckSquare, Clock, Repeat } from 'lucide-react'
import { format } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmModal } from '@/components/ui/Modal'
import { WeeklyBarChart } from '@/components/charts/WeeklyBarChart'
import { TaskForm } from '@/components/forms/TaskForm'
import { useTasks } from '@/hooks/useTasks'
import { useSettings } from '@/hooks/useSettings'
import { getAccentClasses, todayISO } from '@/lib/utils'
import { isVirtualId, describeRecurrence } from '@/lib/recurrence'
import { cn } from '@/lib/cn'
import type { Task } from '@/lib/types'

type FilterStatus = 'all' | 'pending' | 'in-progress' | 'completed'

export default function TasksPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterCategory, setFilterCategory] = useState('')

  const { settings } = useSettings()
  const { tasks, addTask, updateTask, deleteTask, toggleTask, todayStats, getLast7DaysChart, getProgressStats } = useTasks()
  const accent = getAccentClasses(settings.accentColor)

  const chartData = getLast7DaysChart().map(d => ({ day: d.day, value: d.completed }))
  const today = todayISO()
  const progress = getProgressStats()

  // Filter out recurring templates from the visible list
  const filtered = tasks
    .filter(t => (t.recurrence?.type ?? 'once') === 'once' || !!t.parentTaskId)
    .filter(t => filterStatus === 'all' || t.status === filterStatus)
    .filter(t => !filterCategory || t.category === filterCategory)
    .sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2 }
      const pDiff = pOrder[a.priority] - pOrder[b.priority]
      if (pDiff !== 0) return pDiff
      const dateDiff = b.date.localeCompare(a.date)
      if (dateDiff !== 0) return -dateDiff
      return (a.time ?? '').localeCompare(b.time ?? '')
    })

  const categories = Array.from(new Set(tasks.map(t => t.category))).filter(Boolean)

  const FILTERS: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Done', value: 'completed' },
  ]

  function handleDelete(id: string) {
    // Don't allow deleting virtual tasks (they aren't stored yet)
    if (isVirtualId(id)) return
    setDeleteId(id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fadeIn">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{format(new Date(), 'EEEE, MMMM d')}</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Tasks</h1>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90', accent.bg)}
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Multi-level Progress Bars */}
      <Card className="space-y-4 animate-fadeIn" style={{ animationDelay: '50ms' as never }}>
        <div className="space-y-1">
          <ProgressBar
            value={progress.today.percentage}
            label={`Today — ${progress.today.completed} of ${progress.today.total} tasks`}
            showPercent
            size="md"
          />
        </div>
        <div className="space-y-1">
          <ProgressBar
            value={progress.week.percentage}
            label={`This Week — ${progress.week.completed} of ${progress.week.total} tasks`}
            showPercent
            size="md"
          />
        </div>
        <div className="space-y-1">
          <ProgressBar
            value={progress.month.percentage}
            label={`This Month — ${progress.month.completed} of ${progress.month.total} tasks`}
            showPercent
          />
        </div>
        <div className="space-y-1">
          <ProgressBar
            value={progress.year.percentage}
            label={`This Year — ${progress.year.completed} of ${progress.year.total} tasks`}
            showPercent
            size="sm"
          />
        </div>
      </Card>

      {/* Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 animate-fadeIn" style={{ animationDelay: '75ms' as never }}>
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              filterStatus === f.value
                ? cn(accent.bg, 'text-white')
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {f.label}
          </button>
        ))}
        {categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-none outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* Task List */}
      <div className="animate-fadeIn" style={{ animationDelay: '100ms' as never }}>
        {filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={CheckSquare}
              title={filterStatus === 'all' ? 'No tasks yet' : `No ${filterStatus} tasks`}
              description={filterStatus === 'all' ? 'Add your first task to get started' : undefined}
              ctaLabel={filterStatus === 'all' ? 'Add Task' : undefined}
              onCta={filterStatus === 'all' ? () => setFormOpen(true) : undefined}
            />
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(task => {
              const isVirtual = isVirtualId(task.id)
              const recurrenceLabel = describeRecurrence(task.recurrence)
              return (
                <Card key={task.id} padding="sm" className={cn(task.status === 'completed' && 'opacity-60')}>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(task)}
                      className="mt-0.5 shrink-0 transition-colors"
                    >
                      {task.status === 'completed'
                        ? <CheckCircle2 className={cn('w-5 h-5', accent.text)} />
                        : <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 hover:text-gray-400" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium text-gray-900 dark:text-white', task.status === 'completed' && 'line-through')}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge type="priority" value={task.priority} />
                        <Badge type="status" value={task.status} />
                        <span className="text-xs text-gray-400 dark:text-gray-500">{task.category}</span>
                        {task.time && (
                          <span className="flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500">
                            <Clock className="w-3 h-3" />{task.time}
                          </span>
                        )}
                        {task.date !== today && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">{format(new Date(task.date + 'T12:00:00'), 'MMM d')}</span>
                        )}
                        {recurrenceLabel && (
                          <span className="flex items-center gap-0.5 text-xs text-indigo-500 dark:text-indigo-400 font-medium">
                            <Repeat className="w-3 h-3" />{recurrenceLabel}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!isVirtual && (
                        <>
                          <button
                            onClick={() => { setEditTask(task); setFormOpen(true) }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-gray-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Weekly Chart */}
      <Card className="animate-fadeIn" style={{ animationDelay: '200ms' as never }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Weekly Progress</p>
        <WeeklyBarChart data={chartData} label="tasks completed" />
      </Card>

      <TaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTask(undefined) }}
        onSave={data => {
          if (editTask) {
            // Virtual task: materialize as a new real instance with edits
            updateTask(editTask.id, data, editTask)
          } else {
            addTask(data)
          }
        }}
        initial={editTask}
      />
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteTask(deleteId)}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
      />
    </div>
  )
}
