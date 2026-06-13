'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Pencil, Trash2, Dumbbell, Zap, Clock, Activity, Search, TrendingUp, Calendar, BarChart2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmModal } from '@/components/ui/Modal'
import { WeeklyBarChart } from '@/components/charts/WeeklyBarChart'
import { BarChart } from '@/components/charts/BarChart'
import { LineChart } from '@/components/charts/LineChart'
import { WorkoutForm } from '@/components/forms/WorkoutForm'
import { useFitness } from '@/hooks/useFitness'
import { useSettings } from '@/hooks/useSettings'
import { getDayLabel, getAccentClasses, formatDate } from '@/lib/utils'
import { cn } from '@/lib/cn'
import type { Workout } from '@/lib/types'

export default function FitnessPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editWorkout, setEditWorkout] = useState<Workout | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)

  const { settings } = useSettings()
  const {
    workouts, addWorkout, updateWorkout, deleteWorkout,
    weeklyStats, getCurrentWeekChart, getLast10SessionsMinutes, getWeeklyProgress,
    getAttendanceStats, getExerciseNames, getPastWorkoutTypes, getExerciseHistory,
  } = useFitness()
  const accent = getAccentClasses(settings.accentColor)

  const weeklyProgress = getWeeklyProgress(settings.weeklyWorkoutGoal)
  const weekChartData = getCurrentWeekChart().map(d => ({ day: d.day, value: d.sessions }))
  const minutesData = getLast10SessionsMinutes()
  const attendance = getAttendanceStats()
  const exerciseNames = getExerciseNames()
  const pastWorkoutTypes = getPastWorkoutTypes()
  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date))

  const filteredExercises = exerciseSearch.trim()
    ? exerciseNames.filter(n => n.toLowerCase().includes(exerciseSearch.toLowerCase()))
    : exerciseNames

  const exerciseHistory = selectedExercise ? getExerciseHistory(selectedExercise) : []
  const exerciseChartData = exerciseHistory.map(h => ({ date: formatDate(h.date), weight: h.maxWeight }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fadeIn">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Fitness</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Workouts</h1>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90', accent.bg)}
        >
          <Plus className="w-4 h-4" /> Log
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3 animate-fadeIn" style={{ animationDelay: '50ms' as never }}>
        <StatCard icon={Dumbbell} label="Sessions" value={weeklyStats.sessions} iconClassName={cn(accent.text, accent.bgLight)} />
        <StatCard icon={Clock} label="Minutes" value={weeklyStats.minutes} iconClassName="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60" />
        <StatCard icon={Zap} label="Avg Energy" value={weeklyStats.avgEnergy || '–'} iconClassName="text-amber-600 bg-amber-50 dark:bg-amber-950/60" />
      </div>

      {/* Weekly Goal Progress */}
      <Card className="animate-fadeIn" style={{ animationDelay: '75ms' as never }}>
        <ProgressBar
          value={weeklyProgress}
          label={`${weeklyStats.sessions} of ${settings.weeklyWorkoutGoal} sessions this week`}
          showPercent
          size="md"
        />
      </Card>

      {/* ── Attendance Charts ─────────────────────────────────────────────── */}

      {/* This Week — Mon–Sun bar chart */}
      <Card className="animate-fadeIn" style={{ animationDelay: '100ms' as never }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">This Week</p>
          <span className="text-xs text-gray-500 dark:text-gray-400">{weeklyStats.sessions} workout{weeklyStats.sessions !== 1 ? 's' : ''}</span>
        </div>
        <WeeklyBarChart data={weekChartData} label="sessions" height={140} />
      </Card>

      {/* This Month + This Year side by side */}
      <div className="grid grid-cols-2 gap-3 animate-fadeIn" style={{ animationDelay: '125ms' as never }}>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Month</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{attendance.monthCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">workouts logged</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center">
              <BarChart2 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Year</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{attendance.yearTotal}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">workouts this year</p>
        </Card>
      </div>

      {/* This Year — monthly bar chart */}
      <Card className="animate-fadeIn" style={{ animationDelay: '150ms' as never }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Workouts per Month</p>
        <BarChart
          data={attendance.yearBars}
          bars={[{ dataKey: 'count', color: accent.fill, label: 'Workouts' }]}
          xKey="month"
          height={160}
        />
      </Card>

      {/* Minutes Line Chart */}
      <Card className="animate-fadeIn" style={{ animationDelay: '175ms' as never }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Minutes Per Session (Last 10)</p>
        <LineChart data={minutesData} dataKey="minutes" xKey="session" color={accent.fill} label="Minutes" />
      </Card>

      {/* ── Exercise Progress Library ─────────────────────────────────────── */}
      <div className="animate-fadeIn" style={{ animationDelay: '200ms' as never }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Exercise Progress</p>

        {exerciseNames.length === 0 ? (
          <Card>
            <EmptyState icon={TrendingUp} title="No exercises logged" description="Log workouts with exercises to track your strength progress" />
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search exercises…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={exerciseSearch}
                onChange={e => setExerciseSearch(e.target.value)}
              />
            </div>

            {/* Exercise pills */}
            <div className="flex flex-wrap gap-2">
              {filteredExercises.map(name => (
                <button
                  key={name}
                  onClick={() => setSelectedExercise(selectedExercise === name ? null : name)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border',
                    selectedExercise === name
                      ? cn(accent.bg, 'text-white border-transparent')
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  {name}
                </button>
              ))}
              {filteredExercises.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 py-1">No exercises match &quot;{exerciseSearch}&quot;</p>
              )}
            </div>

            {/* Selected exercise detail */}
            {selectedExercise && (
              <Card className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedExercise}</p>
                  <span className="text-xs text-gray-400">{exerciseHistory.length} session{exerciseHistory.length !== 1 ? 's' : ''}</span>
                </div>

                {exerciseHistory.length < 2 ? (
                  <div className="py-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {exerciseHistory.length === 0
                        ? 'No data yet — log this exercise to see progress'
                        : 'Log one more session to see your progress chart'}
                    </p>
                  </div>
                ) : (
                  <LineChart
                    data={exerciseChartData}
                    dataKey="weight"
                    xKey="date"
                    color={accent.fill}
                    label="Max weight"
                    height={180}
                  />
                )}

                {/* Session history table */}
                {exerciseHistory.length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Session History</p>
                    {[...exerciseHistory].reverse().map((h, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="shrink-0 text-xs text-gray-400 dark:text-gray-500 pt-0.5 w-20">{formatDate(h.date)}</div>
                        <div className="flex-1">
                          {h.sets.map((s, si) => (
                            <span key={si} className="inline-block text-xs text-gray-600 dark:text-gray-400 mr-3">
                              {si + 1}. {s.reps} reps @ {s.weight}{s.unit}
                            </span>
                          ))}
                        </div>
                        <div className="shrink-0 text-xs font-semibold text-gray-700 dark:text-gray-300 pt-0.5">
                          max {h.maxWeight}{exerciseHistory[0]?.sets[0]?.unit ?? 'kg'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </div>

      {/* ── Workout History ───────────────────────────────────────────────── */}
      <div className="animate-fadeIn" style={{ animationDelay: '250ms' as never }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">History</p>
        {sorted.length === 0 ? (
          <Card>
            <EmptyState icon={Dumbbell} title="No workouts logged" description="Start tracking your fitness journey" ctaLabel="Log Workout" onCta={() => setFormOpen(true)} />
          </Card>
        ) : (
          <div className="space-y-2">
            {sorted.map(w => {
              const isExpanded = expandedId === w.id
              return (
                <Card key={w.id} padding="sm">
                  <div className="flex items-start gap-3">
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5', accent.bgLight)}>
                      <Activity className={cn('w-4 h-4', accent.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{w.type}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{getDayLabel(w.date)} · {w.durationMinutes} min</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge type="intensity" value={String(w.intensity)} />
                          <button onClick={() => { setEditWorkout(w); setFormOpen(true) }} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => setDeleteId(w.id)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-gray-400 hover:text-rose-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">Energy: {w.energyRating}/10</span>
                        {w.exercises.length > 0 && (
                          <button onClick={() => setExpandedId(isExpanded ? null : w.id)} className="flex items-center gap-0.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                            {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''} {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                      {isExpanded && w.exercises.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                          {w.exercises.map((ex, i) => (
                            <div key={ex.id ?? i}>
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{ex.name}</p>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                                {ex.sets.map((s, si) => (
                                  <span key={si} className="text-xs text-gray-500 dark:text-gray-400">
                                    {si + 1}. {s.reps}r @ {s.weight}{s.unit}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {isExpanded && w.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{w.notes}</p>
                      )}
                      {isExpanded && w.discomfort && (
                        <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">⚠ {w.discomfort}</p>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <WorkoutForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditWorkout(undefined) }}
        onSave={data => editWorkout ? updateWorkout(editWorkout.id, data) : addWorkout(data)}
        initial={editWorkout}
        pastWorkoutTypes={pastWorkoutTypes}
        pastExerciseNames={getExerciseNames()}
      />
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteWorkout(deleteId)}
        title="Delete Workout"
        message="Are you sure you want to delete this workout?"
      />
    </div>
  )
}
