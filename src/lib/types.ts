export interface Transaction {
  id: string
  date: string
  type: 'income' | 'expense' | 'debt'
  amount: number
  description: string
  category: string
  paymentMethod?: string
  notes?: string
  createdAt: string
}

export interface ExerciseSet {
  reps: number
  weight: number
  unit: 'lb' | 'kg'
}

export interface Exercise {
  id: string
  name: string
  sets: ExerciseSet[]
}

export interface Workout {
  id: string
  date: string
  type: string
  durationMinutes: number
  intensity: number
  energyRating: number
  exercises: Exercise[]
  notes?: string
  discomfort?: string
  createdAt: string
}

export interface TaskRecurrence {
  type: 'once' | 'daily' | 'specific-days' | 'until-date'
  daysOfWeek?: number[]  // 0–6 (Sun–Sat), used when type = 'specific-days'
  endDate?: string       // ISO date, used when type = 'until-date'
}

export interface Task {
  id: string
  title: string
  description?: string
  date: string           // for recurring templates this is the start/creation date
  time?: string
  priority: 'low' | 'medium' | 'high'
  category: string
  status: 'pending' | 'in-progress' | 'completed'
  notes?: string
  recurrence?: TaskRecurrence
  parentTaskId?: string  // links generated instances back to their recurring template
  createdAt: string
}

export interface Settings {
  userName: string
  currency: string
  theme: 'light' | 'dark' | 'system'
  financeCategories: string[]
  taskCategories: string[]
  workoutTypes: string[]
  weeklyWorkoutGoal: number
  monthlyIncomeGoal: number
  monthlySavingsGoal: number
  weeklyTaskGoal: number
  accentColor: string
  defaultWeightUnit: 'lb' | 'kg'
}

export interface FinancialGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  category: string
}
