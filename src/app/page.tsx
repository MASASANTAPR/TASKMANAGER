'use client'

import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { CheckSquare, DollarSign, Dumbbell, ArrowRight, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { WeeklyBarChart } from '@/components/charts/WeeklyBarChart'
import { useSettings } from '@/hooks/useSettings'
import { useFinance } from '@/hooks/useFinance'
import { useFitness } from '@/hooks/useFitness'
import { useTasks } from '@/hooks/useTasks'
import { getGreeting, formatCurrency, getAccentClasses } from '@/lib/utils'
import { PRIORITY_COLORS } from '@/lib/constants'
import { cn } from '@/lib/cn'

export default function HomePage() {
  const router = useRouter()
  const { settings } = useSettings()
  const { currentStats, getSavingsProgress } = useFinance()
  const { weeklyStats, getWeeklyProgress, getLast7DaysChart } = useFitness()
  const { todayStats, getLast7DaysChart: getTasksChart, getHighestPriorityTask } = useTasks()

  const accent = getAccentClasses(settings.accentColor)
  const focusTask = getHighestPriorityTask()
  const taskChartData = getTasksChart().map(d => ({ day: d.day, value: d.completed }))
  const fitnessProgress = getWeeklyProgress(settings.weeklyWorkoutGoal)
  const savingsProgress = getSavingsProgress(settings.monthlySavingsGoal)

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="animate-fadeIn">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">
          {getGreeting()}, {settings.userName} 👋
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 animate-fadeIn" style={{ animationDelay: '50ms' }}>
        <StatCard
          icon={CheckSquare}
          label="Tasks Today"
          value={`${todayStats.completed}/${todayStats.total}`}
          iconClassName={cn('text-indigo-600', accent.bgLight)}
          onClick={() => router.push('/tasks')}
        />
        <StatCard
          icon={DollarSign}
          label="Balance"
          value={formatCurrency(currentStats.balance, settings.currency).replace(/\.00$/, '')}
          iconClassName="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60"
          onClick={() => router.push('/finance')}
        />
        <StatCard
          icon={Dumbbell}
          label="Workouts"
          value={`${weeklyStats.sessions}/${settings.weeklyWorkoutGoal}`}
          iconClassName="text-amber-600 bg-amber-50 dark:bg-amber-950/60"
          onClick={() => router.push('/fitness')}
        />
      </div>

      {/* Today's Focus */}
      {focusTask && (
        <Card className="animate-fadeIn cursor-pointer hover:shadow-md transition-shadow" style={{ animationDelay: '100ms' }} onClick={() => router.push('/tasks')}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Today&apos;s Focus</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{focusTask.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-xs font-medium capitalize', PRIORITY_COLORS[focusTask.priority].text)}>
                  {focusTask.priority} priority
                </span>
                {focusTask.time && <span className="text-xs text-gray-400">· {focusTask.time}</span>}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
          </div>
        </Card>
      )}

      {/* Weekly Overview Chart */}
      <Card className="animate-fadeIn" style={{ animationDelay: '150ms' as never }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Weekly Tasks</p>
        <WeeklyBarChart data={taskChartData} label="tasks completed" />
      </Card>

      {/* Finance Summary */}
      <Card
        className="animate-fadeIn cursor-pointer hover:shadow-md transition-shadow"
        style={{ animationDelay: '200ms' as never }}
        onClick={() => router.push('/finance')}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Finance</p>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(currentStats.income, settings.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Expenses</p>
            <p className="text-base font-bold text-rose-600 dark:text-rose-400 tabular-nums">
              {formatCurrency(currentStats.expenses, settings.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
            <p className={cn('text-base font-bold tabular-nums', currentStats.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-rose-600')}>
              {formatCurrency(currentStats.balance, settings.currency)}
            </p>
          </div>
        </div>
        <ProgressBar value={savingsProgress} label="Savings goal" showPercent />
      </Card>

      {/* Fitness Summary */}
      <Card
        className="animate-fadeIn cursor-pointer hover:shadow-md transition-shadow"
        style={{ animationDelay: '250ms' as never }}
        onClick={() => router.push('/fitness')}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Fitness</p>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sessions</p>
            <p className="text-base font-bold text-gray-900 dark:text-white tabular-nums">{weeklyStats.sessions}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Minutes</p>
            <p className="text-base font-bold text-gray-900 dark:text-white tabular-nums">{weeklyStats.minutes}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Energy</p>
            <p className="text-base font-bold text-gray-900 dark:text-white tabular-nums">{weeklyStats.avgEnergy || '–'}</p>
          </div>
        </div>
        <ProgressBar value={fitnessProgress} label="Weekly goal" showPercent />
      </Card>

      {/* Tasks Summary */}
      <Card
        className="animate-fadeIn cursor-pointer hover:shadow-md transition-shadow"
        style={{ animationDelay: '300ms' as never }}
        onClick={() => router.push('/tasks')}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Tasks</p>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
            <p className="text-base font-bold text-gray-900 dark:text-white tabular-nums">{todayStats.completed}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
            <p className="text-base font-bold text-gray-900 dark:text-white tabular-nums">{todayStats.pending}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
            <p className="text-base font-bold text-gray-900 dark:text-white tabular-nums">{todayStats.inProgress}</p>
          </div>
        </div>
        <ProgressBar value={todayStats.progress} label="Daily progress" showPercent />
      </Card>
    </div>
  )
}
