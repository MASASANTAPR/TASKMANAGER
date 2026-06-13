import { getDay, parseISO } from 'date-fns'
import type { Task, TaskRecurrence } from './types'

// A recurring template: has recurrence.type !== 'once' and no parentTaskId
export function isRecurringTemplate(t: Task): boolean {
  return (t.recurrence?.type ?? 'once') !== 'once' && !t.parentTaskId
}

// Whether a recurring template applies to a given ISO date
export function recurrenceAppliesOnDate(template: Task, date: string): boolean {
  const r = template.recurrence
  if (!r || r.type === 'once') return template.date === date
  // Must be on or after the template's start date
  if (date < template.date) return false

  switch (r.type) {
    case 'daily':
      return true
    case 'specific-days':
      return (r.daysOfWeek ?? []).includes(getDay(parseISO(date)))
    case 'until-date':
      return !r.endDate || date <= r.endDate
    default:
      return false
  }
}

// Virtual tasks are computed instances not yet in storage.
// Their id follows: 'virtual_<templateId>_<date>'
export function makeVirtualId(templateId: string, date: string): string {
  return `virtual_${templateId}_${date}`
}

export function isVirtualId(id: string): boolean {
  return id.startsWith('virtual_')
}

// Given all stored tasks, return the full list for display:
// - regular once-tasks (all dates)
// - saved recurring instances (all dates)
// - virtual recurring instances for TODAY (not yet in storage)
export function buildDisplayTasks(tasks: Task[], today: string): Task[] {
  const templates = tasks.filter(isRecurringTemplate)
  const realTasks = tasks.filter(t => !isRecurringTemplate(t))

  const virtualTasks: Task[] = []
  templates.forEach(template => {
    if (!recurrenceAppliesOnDate(template, today)) return
    const alreadySaved = realTasks.some(
      t => t.parentTaskId === template.id && t.date === today
    )
    if (!alreadySaved) {
      virtualTasks.push({
        ...template,
        id: makeVirtualId(template.id, today),
        date: today,
        status: 'pending',
        parentTaskId: template.id,
      })
    }
  })

  return [...realTasks, ...virtualTasks]
}

export function describeRecurrence(r: TaskRecurrence | undefined): string {
  if (!r || r.type === 'once') return ''
  // CUSTOMIZE: day names used in recurrence descriptions
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  switch (r.type) {
    case 'daily': return 'Every day'
    case 'specific-days':
      return (r.daysOfWeek ?? []).map(d => dayNames[d]).join(', ')
    case 'until-date':
      return r.endDate ? `Daily until ${r.endDate}` : 'Daily'
    default: return ''
  }
}
