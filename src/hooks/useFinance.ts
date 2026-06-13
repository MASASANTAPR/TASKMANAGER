'use client'

import { useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { generateId, getMonthRange, getLast7Days, calcProgress } from '@/lib/utils'
import { format, parseISO, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns'
import type { Transaction, FinancialGoal } from '@/lib/types'

// TODO: Replace with API calls when a backend is available

export function useFinance() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('mp_transactions', [])
  const [goals, setGoals] = useLocalStorage<FinancialGoal[]>('mp_goals', [])

  function addTransaction(data: Omit<Transaction, 'id' | 'createdAt'>) {
    const tx: Transaction = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    setTransactions(prev => [tx, ...prev])
  }

  function updateTransaction(id: string, data: Partial<Transaction>) {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
  }

  function deleteTransaction(id: string) {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  function addGoal(data: Omit<FinancialGoal, 'id'>) {
    const goal: FinancialGoal = { ...data, id: generateId() }
    setGoals(prev => [...prev, goal])
  }

  function updateGoal(id: string, data: Partial<FinancialGoal>) {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...data } : g))
  }

  function deleteGoal(id: string) {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  function getMonthlyStats(year: number, month: number) {
    const { start, end } = getMonthRange(year, month)
    const monthly = transactions.filter(t => t.date >= start && t.date <= end)
    const income = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expenses = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance = income - expenses
    return { income, expenses, balance, transactions: monthly }
  }

  function getExpensesByCategory(year: number, month: number) {
    const { transactions: monthly } = getMonthlyStats(year, month)
    const byCategory: Record<string, number> = {}
    monthly.filter(t => t.type === 'expense').forEach(t => {
      byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount
    })
    return Object.entries(byCategory).map(([name, value]) => ({ name, value }))
  }

  function getWeeklyIncomeExpenses(year: number, month: number) {
    const { start, end } = getMonthRange(year, month)
    const monthly = transactions.filter(t => t.date >= start && t.date <= end)
    const weeks: { week: string; income: number; expenses: number }[] = []
    const startDate = parseISO(start)
    const endDate = parseISO(end)
    let current = startOfWeek(startDate, { weekStartsOn: 1 })
    let weekNum = 1
    while (current <= endDate) {
      const weekEnd = endOfWeek(current, { weekStartsOn: 1 })
      const label = `W${weekNum}`
      const weekTxs = monthly.filter(t => {
        const d = parseISO(t.date)
        return isWithinInterval(d, { start: current, end: weekEnd })
      })
      weeks.push({
        week: label,
        income: weekTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expenses: weekTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      })
      current = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000)
      weekNum++
      if (weekNum > 6) break
    }
    return weeks
  }

  function getRunningBalance(year: number, month: number) {
    const { start, end } = getMonthRange(year, month)
    const monthly = transactions
      .filter(t => t.date >= start && t.date <= end)
      .sort((a, b) => a.date.localeCompare(b.date))
    let balance = 0
    return monthly.map(t => {
      balance += t.type === 'income' ? t.amount : -t.amount
      return { date: format(parseISO(t.date), 'MMM d'), balance: Math.round(balance * 100) / 100 }
    })
  }

  const currentStats = useMemo(() => {
    const now = new Date()
    return getMonthlyStats(now.getFullYear(), now.getMonth())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions])

  function getSavingsProgress(monthlySavingsGoal: number) {
    return calcProgress(currentStats.balance, monthlySavingsGoal)
  }

  return {
    transactions,
    goals,
    addTransaction, updateTransaction, deleteTransaction,
    addGoal, updateGoal, deleteGoal,
    getMonthlyStats,
    getExpensesByCategory,
    getWeeklyIncomeExpenses,
    getRunningBalance,
    currentStats,
    getSavingsProgress,
  }
}
