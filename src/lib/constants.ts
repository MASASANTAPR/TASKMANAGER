import type { Settings } from './types'

// CUSTOMIZE: Default finance categories — add or remove as needed
export const DEFAULT_FINANCE_CATEGORIES = [
  'Housing',
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Health & Fitness',
  'Shopping',
  'Utilities',
  'Education',
  'Travel',
  'Savings',
  'Investment',
  'Salary',
  'Freelance',
  'Other',
]

// CUSTOMIZE: Default task categories
export const DEFAULT_TASK_CATEGORIES = [
  'Work',
  'Personal',
  'Health',
  'Learning',
  'Finance',
  'Social',
  'Home',
  'Other',
]

// CUSTOMIZE: Default workout types
export const DEFAULT_WORKOUT_TYPES = [
  'Strength Training',
  'Cardio',
  'HIIT',
  'Yoga',
  'Pilates',
  'Running',
  'Cycling',
  'Swimming',
  'Sports',
  'Stretching',
  'Other',
]

// CUSTOMIZE: Accent color options (Tailwind color names)
export const ACCENT_COLORS = [
  { name: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50', dark: 'dark:bg-indigo-950' },
  { name: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', dark: 'dark:bg-emerald-950' },
  { name: 'violet', label: 'Violet', bg: 'bg-violet-500', text: 'text-violet-600', light: 'bg-violet-50', dark: 'dark:bg-violet-950' },
  { name: 'rose', label: 'Rose', bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50', dark: 'dark:bg-rose-950' },
  { name: 'amber', label: 'Amber', bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50', dark: 'dark:bg-amber-950' },
]

// CUSTOMIZE: Default numeric goals
export const DEFAULT_SETTINGS: Settings = {
  userName: 'Friend',
  currency: 'USD',
  theme: 'system',
  financeCategories: DEFAULT_FINANCE_CATEGORIES,
  taskCategories: DEFAULT_TASK_CATEGORIES,
  workoutTypes: DEFAULT_WORKOUT_TYPES,
  weeklyWorkoutGoal: 4,
  monthlyIncomeGoal: 5000,
  monthlySavingsGoal: 1000,
  weeklyTaskGoal: 20,
  accentColor: 'indigo',
  // CUSTOMIZE: Default weight unit for exercises — 'kg' or 'lb'
  defaultWeightUnit: 'kg',
}

// CUSTOMIZE: Chart colors for data visualization
export const CHART_COLORS = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#84cc16', // lime
]

export const PRIORITY_COLORS = {
  low: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  medium: { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-400' },
  high: { bg: 'bg-rose-50 dark:bg-rose-950/50', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
}

export const STATUS_COLORS = {
  pending: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
  'in-progress': { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-400' },
  completed: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-400' },
}

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'MXN', label: 'MXN — Mexican Peso' },
  { value: 'BRL', label: 'BRL — Brazilian Real' },
]

export const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet', 'Other']

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
