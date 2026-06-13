'use client'

import { useMemo, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { generateId, getWeekDays, calcProgress, getMonthRange, getCurrentYearRange } from '@/lib/utils'
import { migrateWorkout } from '@/lib/utils'
import { format } from 'date-fns'
import type { Workout } from '@/lib/types'

// TODO: Replace with API calls when a backend is available

export function useFitness() {
  const [rawWorkouts, setWorkouts] = useLocalStorage<Workout[]>('mp_workouts', [])

  // Migrate old exercise format on first load
  useEffect(() => {
    if (rawWorkouts.length > 0 && rawWorkouts.some(w => w.exercises?.some(e => typeof (e as unknown as Record<string,unknown>).sets === 'number'))) {
      setWorkouts(rawWorkouts.map(migrateWorkout))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const workouts = rawWorkouts

  function addWorkout(data: Omit<Workout, 'id' | 'createdAt'>) {
    const w: Workout = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    setWorkouts(prev => [w, ...prev])
  }

  function updateWorkout(id: string, data: Partial<Workout>) {
    setWorkouts(prev => prev.map(w => w.id === id ? { ...w, ...data } : w))
  }

  function deleteWorkout(id: string) {
    setWorkouts(prev => prev.filter(w => w.id !== id))
  }

  const weeklyStats = useMemo(() => {
    const weekDays = getWeekDays()
    const weekWorkouts = workouts.filter(w => weekDays.includes(w.date))
    const sessions = weekWorkouts.length
    const minutes = weekWorkouts.reduce((s, w) => s + w.durationMinutes, 0)
    const avgEnergy = sessions > 0
      ? Math.round(weekWorkouts.reduce((s, w) => s + w.energyRating, 0) / sessions * 10) / 10
      : 0
    return { sessions, minutes, avgEnergy }
  }, [workouts])

  function getLast7DaysChart() {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (6 - i))
      const dateStr = format(d, 'yyyy-MM-dd')
      return {
        day: format(d, 'EEE'),
        sessions: workouts.filter(w => w.date === dateStr).length,
      }
    })
  }

  // Current Mon–Sun week with workout presence per day
  function getCurrentWeekChart() {
    const weekDays = getWeekDays()
    return weekDays.map(date => ({
      day: format(new Date(date + 'T12:00:00'), 'EEE'),
      sessions: workouts.filter(w => w.date === date).length,
    }))
  }

  function getLast10SessionsMinutes() {
    return [...workouts]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10)
      .reverse()
      .map((w, i) => ({
        session: `S${i + 1}`,
        minutes: w.durationMinutes,
        date: w.date,
        type: w.type,
      }))
  }

  function getWeeklyProgress(weeklyGoal: number) {
    return calcProgress(weeklyStats.sessions, weeklyGoal)
  }

  // ── Attendance stats ──────────────────────────────────────────────────────

  function getAttendanceStats() {
    const now = new Date()
    const year = now.getFullYear()
    const weekDays = getWeekDays()

    // Week: Mon–Sun, boolean per day
    const week = weekDays.map(date => ({
      day: format(new Date(date + 'T12:00:00'), 'EEE'),
      date,
      worked: workouts.some(w => w.date === date),
      sessions: workouts.filter(w => w.date === date).length,
    }))

    // Month: count this calendar month
    const { start: mStart, end: mEnd } = getMonthRange(now.getFullYear(), now.getMonth())
    const monthCount = workouts.filter(w => w.date >= mStart && w.date <= mEnd).length

    // Year: 12 bars Jan–Dec
    const yearBars = Array.from({ length: 12 }, (_, month) => {
      const { start, end } = getMonthRange(year, month)
      return {
        month: format(new Date(year, month, 1), 'MMM'),
        count: workouts.filter(w => w.date >= start && w.date <= end).length,
      }
    })

    const { start: yStart, end: yEnd } = getCurrentYearRange()
    const yearTotal = workouts.filter(w => w.date >= yStart && w.date <= yEnd).length

    return { week, monthCount, yearBars, yearTotal }
  }

  // ── Exercise Library ──────────────────────────────────────────────────────

  function getExerciseNames(): string[] {
    const names = new Set<string>()
    workouts.forEach(w =>
      w.exercises.forEach(ex => { if (ex.name.trim()) names.add(ex.name.trim()) })
    )
    return Array.from(names).sort()
  }

  // All unique workout type labels the user has used (for autocomplete)
  function getPastWorkoutTypes(): string[] {
    const types = new Set(workouts.map(w => w.type).filter(Boolean))
    return Array.from(types)
  }

  function getExerciseHistory(exerciseName: string) {
    const sessionMap = new Map<string, { maxWeight: number; sets: Array<{ reps: number; weight: number; unit: string }>; workoutType: string }>()

    workouts.forEach(w => {
      w.exercises
        .filter(ex => ex.name.trim().toLowerCase() === exerciseName.toLowerCase())
        .forEach(ex => {
          const existing = sessionMap.get(w.date)
          const allSets = ex.sets.map(s => ({ reps: s.reps, weight: s.weight, unit: s.unit }))
          const maxW = ex.sets.reduce((m, s) => Math.max(m, s.weight), 0)
          if (!existing || maxW > existing.maxWeight) {
            sessionMap.set(w.date, { maxWeight: maxW, sets: allSets, workoutType: w.type })
          }
        })
    })

    return Array.from(sessionMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }))
  }

  return {
    workouts,
    addWorkout, updateWorkout, deleteWorkout,
    weeklyStats,
    getLast7DaysChart,
    getCurrentWeekChart,
    getLast10SessionsMinutes,
    getWeeklyProgress,
    getAttendanceStats,
    getExerciseNames,
    getPastWorkoutTypes,
    getExerciseHistory,
  }
}
