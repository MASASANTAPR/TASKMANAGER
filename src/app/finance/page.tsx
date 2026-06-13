'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, DollarSign, TrendingUp, TrendingDown, Target, Flag } from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmModal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { DonutChart } from '@/components/charts/DonutChart'
import { BarChart } from '@/components/charts/BarChart'
import { LineChart } from '@/components/charts/LineChart'
import { TransactionForm } from '@/components/forms/TransactionForm'
import { GoalForm } from '@/components/forms/GoalForm'
import { useFinance } from '@/hooks/useFinance'
import { useSettings } from '@/hooks/useSettings'
import { formatCurrency, formatDate, getDayLabel, calcProgress, getAccentClasses } from '@/lib/utils'
import { CHART_COLORS } from '@/lib/constants'
import { groupByDate } from '@/lib/utils'
import { cn } from '@/lib/cn'
import type { Transaction, FinancialGoal } from '@/lib/types'

export default function FinancePage() {
  const [viewDate, setViewDate] = useState(new Date())
  const [txFormOpen, setTxFormOpen] = useState(false)
  const [goalFormOpen, setGoalFormOpen] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | undefined>()
  const [editGoal, setEditGoal] = useState<FinancialGoal | undefined>()
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null)
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null)

  const { settings } = useSettings()
  const { transactions, goals, addTransaction, updateTransaction, deleteTransaction, addGoal, updateGoal, deleteGoal, getMonthlyStats, getExpensesByCategory, getWeeklyIncomeExpenses, getRunningBalance } = useFinance()
  const accent = getAccentClasses(settings.accentColor)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const stats = getMonthlyStats(year, month)
  const expensesByCategory = getExpensesByCategory(year, month)
  const weeklyData = getWeeklyIncomeExpenses(year, month)
  const runningBalance = getRunningBalance(year, month)
  const savingsProgress = calcProgress(stats.balance, settings.monthlySavingsGoal)

  const grouped = groupByDate(stats.transactions.sort((a, b) => b.date.localeCompare(a.date)))
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fadeIn">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Finance</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Overview</h1>
        </div>
        <button
          onClick={() => setTxFormOpen(true)}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90', accent.bg)}
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-between animate-fadeIn">
        <button onClick={() => setViewDate(d => subMonths(d, 1))} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{format(viewDate, 'MMMM yyyy')}</p>
        <button onClick={() => setViewDate(d => addMonths(d, 1))} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 animate-fadeIn" style={{ animationDelay: '50ms' as never }}>
        <StatCard icon={TrendingUp} label="Total Income" value={formatCurrency(stats.income, settings.currency)} iconClassName="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60" />
        <StatCard icon={TrendingDown} label="Total Expenses" value={formatCurrency(stats.expenses, settings.currency)} iconClassName="text-rose-600 bg-rose-50 dark:bg-rose-950/60" />
        <StatCard icon={DollarSign} label="Balance" value={formatCurrency(stats.balance, settings.currency)} iconClassName={cn(accent.text, accent.bgLight)} />
        <StatCard icon={Target} label="Savings Goal" value={`${savingsProgress}%`} iconClassName="text-amber-600 bg-amber-50 dark:bg-amber-950/60" />
      </div>

      {/* Donut Chart */}
      <Card className="animate-fadeIn" style={{ animationDelay: '100ms' as never }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Expenses by Category</p>
        <DonutChart data={expensesByCategory} currency={settings.currency} />
      </Card>

      {/* Bar Chart */}
      <Card className="animate-fadeIn" style={{ animationDelay: '150ms' as never }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Income vs Expenses by Week</p>
        <BarChart
          data={weeklyData}
          bars={[
            { dataKey: 'income', color: '#10b981', label: 'Income' },
            { dataKey: 'expenses', color: '#f43f5e', label: 'Expenses' },
          ]}
          xKey="week"
          currency={settings.currency}
        />
      </Card>

      {/* Line Chart */}
      <Card className="animate-fadeIn" style={{ animationDelay: '175ms' as never }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Running Balance</p>
        <LineChart
          data={runningBalance}
          dataKey="balance"
          xKey="date"
          color={accent.fill}
          currency={settings.currency}
          label="Balance"
        />
      </Card>

      {/* Financial Goals */}
      <div className="animate-fadeIn" style={{ animationDelay: '200ms' as never }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Financial Goals</p>
          <button onClick={() => { setEditGoal(undefined); setGoalFormOpen(true) }} className={cn('flex items-center gap-1 text-xs font-medium', accent.text)}>
            <Plus className="w-3 h-3" /> Add Goal
          </button>
        </div>
        {goals.length === 0 ? (
          <Card>
            <EmptyState icon={Flag} title="No goals yet" description="Set a savings target to track your progress" ctaLabel="Add Goal" onCta={() => setGoalFormOpen(true)} />
          </Card>
        ) : (
          <div className="space-y-3">
            {goals.map(goal => {
              const progress = calcProgress(goal.currentAmount, goal.targetAmount)
              return (
                <Card key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{goal.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{goal.category}{goal.deadline ? ` · Due ${formatDate(goal.deadline)}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditGoal(goal); setGoalFormOpen(true) }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteGoalId(goal.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-gray-400 hover:text-rose-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <ProgressBar value={progress} showPercent />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatCurrency(goal.currentAmount, settings.currency)}</span>
                    <span>{formatCurrency(goal.targetAmount, settings.currency)}</span>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="animate-fadeIn" style={{ animationDelay: '250ms' as never }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Transactions</p>
        {stats.transactions.length === 0 ? (
          <Card>
            <EmptyState icon={DollarSign} title="No transactions" description="Add your first transaction to start tracking" ctaLabel="Add Transaction" onCta={() => setTxFormOpen(true)} />
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedDates.map(date => (
              <div key={date}>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">{getDayLabel(date)}</p>
                <div className="space-y-1.5">
                  {grouped[date].map(tx => (
                    <Card key={tx.id} padding="sm">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold',
                          tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700' : tx.type === 'expense' ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700' : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700'
                        )}>
                          {tx.category.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tx.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{tx.category}{tx.paymentMethod ? ` · ${tx.paymentMethod}` : ''}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={cn('text-sm font-bold tabular-nums', tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, settings.currency)}
                          </span>
                          <button onClick={() => { setEditTx(tx); setTxFormOpen(true) }} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => setDeleteTxId(tx.id)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-gray-400 hover:text-rose-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Forms */}
      <TransactionForm
        open={txFormOpen}
        onClose={() => { setTxFormOpen(false); setEditTx(undefined) }}
        onSave={data => editTx ? updateTransaction(editTx.id, data) : addTransaction(data)}
        initial={editTx}
      />
      <GoalForm
        open={goalFormOpen}
        onClose={() => { setGoalFormOpen(false); setEditGoal(undefined) }}
        onSave={data => editGoal ? updateGoal(editGoal.id, data) : addGoal(data)}
        initial={editGoal}
      />
      <ConfirmModal
        open={!!deleteTxId}
        onClose={() => setDeleteTxId(null)}
        onConfirm={() => deleteTxId && deleteTransaction(deleteTxId)}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This cannot be undone."
      />
      <ConfirmModal
        open={!!deleteGoalId}
        onClose={() => setDeleteGoalId(null)}
        onConfirm={() => deleteGoalId && deleteGoal(deleteGoalId)}
        title="Delete Goal"
        message="Are you sure you want to delete this goal?"
      />
    </div>
  )
}
