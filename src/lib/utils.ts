import {
  format, startOfWeek, endOfWeek, eachDayOfInterval, subDays,
  startOfMonth, endOfMonth, startOfYear, endOfYear,
  parseISO, isValid, getDay, getDaysInMonth,
} from 'date-fns'
import type { Task, Workout, ExerciseSet } from './types'
import { generateId } from './utils_id'

export { generateId }

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return dateStr
    return format(date, 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return dateStr
    return format(date, 'MMM d')
  } catch {
    return dateStr
  }
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date()
  return {
    start: format(startOfMonth(now), 'yyyy-MM-dd'),
    end: format(endOfMonth(now), 'yyyy-MM-dd'),
  }
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const date = new Date(year, month, 1)
  return {
    start: format(startOfMonth(date), 'yyyy-MM-dd'),
    end: format(endOfMonth(date), 'yyyy-MM-dd'),
  }
}

export function getCurrentYearRange(): { start: string; end: string } {
  const now = new Date()
  return {
    start: format(startOfYear(now), 'yyyy-MM-dd'),
    end: format(endOfYear(now), 'yyyy-MM-dd'),
  }
}

export function getLast7Days(): string[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) =>
    format(subDays(today, 6 - i), 'yyyy-MM-dd')
  )
}

export function getWeekDays(): string[] {
  const today = new Date()
  const start = startOfWeek(today, { weekStartsOn: 1 })
  const end = endOfWeek(today, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'))
}

export function getMonthDaysCount(): number {
  return getDaysInMonth(new Date())
}

export function calcProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function groupByDate<T extends { date: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const key = item.date
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export function getAccentClasses(color: string) {
  const map: Record<string, { text: string; bg: string; bgLight: string; border: string; fill: string }> = {
    indigo: { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-600', bgLight: 'bg-indigo-50 dark:bg-indigo-950/60', border: 'border-indigo-200 dark:border-indigo-800', fill: '#6366f1' },
    emerald: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-600', bgLight: 'bg-emerald-50 dark:bg-emerald-950/60', border: 'border-emerald-200 dark:border-emerald-800', fill: '#10b981' },
    violet: { text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-600', bgLight: 'bg-violet-50 dark:bg-violet-950/60', border: 'border-violet-200 dark:border-violet-800', fill: '#8b5cf6' },
    rose: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-600', bgLight: 'bg-rose-50 dark:bg-rose-950/60', border: 'border-rose-200 dark:border-rose-800', fill: '#f43f5e' },
    amber: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-600', bgLight: 'bg-amber-50 dark:bg-amber-950/60', border: 'border-amber-200 dark:border-amber-800', fill: '#f59e0b' },
  }
  return map[color] ?? map['indigo']
}

export function getDayLabel(dateStr: string): string {
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return dateStr
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    if (dateStr === today) return 'Today'
    if (dateStr === yesterday) return 'Yesterday'
    return format(date, 'EEE, MMM d')
  } catch {
    return dateStr
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

// ── Data migrations ───────────────────────────────────────────────────────────
// These run once when old localStorage data is detected on load.

export function migrateTask(t: unknown): Task {
  const task = t as Task & { recurrence?: unknown }
  if (!task.recurrence) {
    return { ...task, recurrence: { type: 'once' as const } }
  }
  return task
}

export function migrateWorkout(w: unknown): Workout {
  type OldExercise = { name: string; sets: number; reps: number; weight?: number }
  type NewExercise = { id?: string; name: string; sets: ExerciseSet[] }
  const workout = w as Omit<Workout, 'exercises'> & { exercises: (OldExercise | NewExercise)[] }

  if (!workout.exercises?.length) return workout as unknown as Workout

  const firstEx = workout.exercises[0]
  if (typeof (firstEx as OldExercise).sets === 'number') {
    // Old format
    return {
      ...(workout as unknown as Workout),
      exercises: (workout.exercises as OldExercise[]).map(ex => ({
        id: generateId(),
        name: ex.name,
        sets: Array.from({ length: ex.sets }, () => ({
          reps: ex.reps,
          weight: ex.weight ?? 0,
          unit: 'kg' as const,
        } satisfies ExerciseSet)),
      })),
    }
  }
  // New format — ensure each exercise has an id
  return {
    ...(workout as unknown as Workout),
    exercises: (workout.exercises as NewExercise[]).map(ex => ({
      ...ex,
      id: ex.id || generateId(),
      sets: ex.sets ?? [],
    })),
  }
}
