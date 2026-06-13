'use client'

import { useMemo, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { generateId, todayISO, calcProgress, getWeekDays, getCurrentYearRange, getMonthRange } from '@/lib/utils'
import { format } from 'date-fns'
import { migrateTask } from '@/lib/utils'
import {
  buildDisplayTasks,
  isVirtualId,
  isRecurringTemplate,
  makeVirtualId,
} from '@/lib/recurrence'
import type { Task } from '@/lib/types'

// TODO: Replace with API calls when a backend is available

export function useTasks() {
  const [rawTasks, setTasks] = useLocalStorage<Task[]>('mp_tasks', [])

  // Migrate old tasks (no recurrence field) on first load
  useEffect(() => {
    if (rawTasks.length > 0 && rawTasks.some(t => !t.recurrence)) {
      setTasks(rawTasks.map(migrateTask))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Alias — all stored tasks (templates + instances + once tasks)
  const tasks = rawTasks

  // Display list: no templates, virtual today-instances added
  const displayTasks = useMemo(
    () => buildDisplayTasks(tasks, todayISO()),
    [tasks]
  )

  function addTask(data: Omit<Task, 'id' | 'createdAt'>) {
    const task: Task = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    setTasks(prev => [task, ...prev])
  }

  function updateTask(id: string, data: Partial<Task>, originalTask?: Task) {
    if (isVirtualId(id) && originalTask) {
      // Materialize the virtual instance with the edits applied
      const realTask: Task = { ...originalTask, ...data, id: generateId(), createdAt: new Date().toISOString() }
      setTasks(prev => [...prev, realTask])
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
    }
  }

  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  // Delete an entire recurring series (template + all its instances)
  function deleteTaskSeries(templateId: string) {
    setTasks(prev => prev.filter(t => t.id !== templateId && t.parentTaskId !== templateId))
  }

  function toggleTask(task: Task) {
    if (isVirtualId(task.id)) {
      // Materialize and save as completed
      const newStatus = task.status === 'completed' ? 'pending' : 'completed'
      const realTask: Task = { ...task, id: generateId(), status: newStatus, createdAt: new Date().toISOString() }
      setTasks(prev => [...prev, realTask])
    } else {
      setTasks(prev => prev.map(t => {
        if (t.id !== task.id) return t
        return { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
      }))
    }
  }

  // ── Stats helpers ─────────────────────────────────────────────────────────
  // Only non-template tasks count toward stats

  const todayStats = useMemo(() => {
    const today = todayISO()
    // Use displayTasks so virtual today instances are counted
    const todayTasks = displayTasks.filter(t => t.date === today && !isRecurringTemplate(t))
    const completed = todayTasks.filter(t => t.status === 'completed').length
    const total = todayTasks.length
    return {
      completed,
      total,
      pending: todayTasks.filter(t => t.status === 'pending').length,
      inProgress: todayTasks.filter(t => t.status === 'in-progress').length,
      progress: calcProgress(completed, total),
    }
  }, [displayTasks])

  function getProgressStats() {
    const today = todayISO()
    const now = new Date()
    const weekDays = getWeekDays()
    const { start: monthStart, end: monthEnd } = getMonthRange(now.getFullYear(), now.getMonth())
    const { start: yearStart, end: yearEnd } = getCurrentYearRange()

    // Count only non-template tasks; use displayTasks so today's virtual instances count
    const countable = displayTasks.filter(t => !isRecurringTemplate(t))

    const inRange = (t: Task, start: string, end: string) => t.date >= start && t.date <= end

    function stats(list: Task[]) {
      const completed = list.filter(t => t.status === 'completed').length
      const total = list.length
      return { completed, total, percentage: calcProgress(completed, total) }
    }

    return {
      today: stats(countable.filter(t => t.date === today)),
      week: stats(countable.filter(t => weekDays.includes(t.date))),
      month: stats(countable.filter(t => inRange(t, monthStart, monthEnd))),
      year: stats(countable.filter(t => inRange(t, yearStart, yearEnd))),
    }
  }

  function getLast7DaysChart() {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (6 - i))
      const dateStr = format(d, 'yyyy-MM-dd')
      return {
        day: format(d, 'EEE'),
        completed: displayTasks.filter(t => t.date === dateStr && t.status === 'completed').length,
      }
    })
  }

  function getHighestPriorityTask(): Task | null {
    const today = todayISO()
    const pending = displayTasks.filter(t => t.date === today && t.status !== 'completed' && !isRecurringTemplate(t))
    if (!pending.length) return null
    const pOrder = { high: 0, medium: 1, low: 2 }
    return [...pending].sort((a, b) => pOrder[a.priority] - pOrder[b.priority])[0]
  }

  function getWeeklyProgress(weeklyGoal: number) {
    const days = getWeekDays()
    const completed = displayTasks.filter(t => days.includes(t.date) && t.status === 'completed').length
    return { completed, progress: calcProgress(completed, weeklyGoal) }
  }

  return {
    tasks: displayTasks,      // use this for rendering
    rawTasks,                 // all stored records including templates
    addTask, updateTask, deleteTask, deleteTaskSeries, toggleTask,
    todayStats,
    getProgressStats,
    getLast7DaysChart,
    getHighestPriorityTask,
    getWeeklyProgress,
  }
}
