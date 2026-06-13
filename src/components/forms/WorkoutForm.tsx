'use client'

import { useState } from 'react'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useSettings } from '@/hooks/useSettings'
import { todayISO } from '@/lib/utils'
import { generateId } from '@/lib/utils_id'
import type { Workout, Exercise, ExerciseSet } from '@/lib/types'

interface WorkoutFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Workout, 'id' | 'createdAt'>) => void
  initial?: Workout
  pastWorkoutTypes?: string[]
  pastExerciseNames?: string[]
}

function makeSet(unit: 'kg' | 'lb'): ExerciseSet {
  return { reps: 10, weight: 0, unit }
}

function makeExercise(unit: 'kg' | 'lb'): Exercise {
  return { id: generateId(), name: '', sets: [makeSet(unit)] }
}

const EMPTY = (unit: 'kg' | 'lb') => ({
  date: todayISO(),
  type: '',
  durationMinutes: 30,
  intensity: 5,
  energyRating: 5,
  exercises: [] as Exercise[],
  notes: '',
  discomfort: '',
  defaultUnit: unit,
})

export function WorkoutForm({ open, onClose, onSave, initial, pastWorkoutTypes = [], pastExerciseNames = [] }: WorkoutFormProps) {
  const { settings } = useSettings()
  const unit = (settings.defaultWeightUnit ?? 'kg') as 'kg' | 'lb'

  const [form, setForm] = useState(() => initial
    ? { ...initial, notes: initial.notes ?? '', discomfort: initial.discomfort ?? '', defaultUnit: unit }
    : EMPTY(unit)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set(field: string, value: unknown) {
    setForm(p => ({ ...p, [field]: value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  // ── Exercise management ──────────────────────────────────────────────────

  function addExercise() {
    setForm(p => ({ ...p, exercises: [...p.exercises, makeExercise(unit)] }))
  }

  function removeExercise(exIdx: number) {
    setForm(p => ({ ...p, exercises: p.exercises.filter((_, i) => i !== exIdx) }))
  }

  function setExerciseName(exIdx: number, name: string) {
    setForm(p => {
      const exercises = [...p.exercises]
      exercises[exIdx] = { ...exercises[exIdx], name }
      return { ...p, exercises }
    })
  }

  function addSet(exIdx: number) {
    setForm(p => {
      const exercises = [...p.exercises]
      const lastSet = exercises[exIdx].sets.at(-1)
      const newSet: ExerciseSet = lastSet
        ? { ...lastSet }
        : makeSet(unit)
      exercises[exIdx] = { ...exercises[exIdx], sets: [...exercises[exIdx].sets, newSet] }
      return { ...p, exercises }
    })
  }

  function removeSet(exIdx: number, setIdx: number) {
    setForm(p => {
      const exercises = [...p.exercises]
      exercises[exIdx] = { ...exercises[exIdx], sets: exercises[exIdx].sets.filter((_, i) => i !== setIdx) }
      return { ...p, exercises }
    })
  }

  function updateSet(exIdx: number, setIdx: number, field: keyof ExerciseSet, value: string | number) {
    setForm(p => {
      const exercises = [...p.exercises]
      const sets = [...exercises[exIdx].sets]
      sets[setIdx] = { ...sets[setIdx], [field]: field === 'unit' ? value : Number(value) }
      exercises[exIdx] = { ...exercises[exIdx], sets }
      return { ...p, exercises }
    })
  }

  // ── Validation + submit ──────────────────────────────────────────────────

  function validate() {
    const e: Record<string, string> = {}
    if (!form.type.trim()) e.type = 'Workout label is required'
    if (!form.date) e.date = 'Date is required'
    if (Number(form.durationMinutes) <= 0) e.durationMinutes = 'Duration must be > 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSave({
      date: form.date,
      type: form.type.trim(),
      durationMinutes: Number(form.durationMinutes),
      intensity: Number(form.intensity),
      energyRating: Number(form.energyRating),
      exercises: form.exercises.filter(ex => ex.name.trim()),
      notes: form.notes || undefined,
      discomfort: form.discomfort || undefined,
    })
    setForm(EMPTY(unit))
    onClose()
  }

  // ── Autocomplete lists ───────────────────────────────────────────────────

  const allWorkoutTypes = Array.from(new Set([...settings.workoutTypes, ...pastWorkoutTypes]))
  const allExerciseNames = pastExerciseNames

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'
  const labelCls = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1'
  const smallInputCls = 'px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition text-center w-full'

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Workout' : 'Log Workout'} size="lg">
      {/* Autocomplete lists */}
      <datalist id="workout-types">
        {allWorkoutTypes.map(t => <option key={t} value={t} />)}
      </datalist>
      <datalist id="exercise-names">
        {allExerciseNames.map(n => <option key={n} value={n} />)}
      </datalist>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Workout label + date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Workout Label *</label>
            <input
              type="text"
              placeholder="e.g. Push Day, Cardio…"
              list="workout-types"
              className={inputCls}
              value={form.type}
              onChange={e => set('type', e.target.value)}
            />
            {errors.type && <p className="text-xs text-rose-500 mt-1">{errors.type}</p>}
          </div>
          <div>
            <label className={labelCls}>Date *</label>
            <input type="date" className={inputCls} value={form.date} onChange={e => set('date', e.target.value)} />
            {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className={labelCls}>Duration (minutes) *</label>
          <input type="number" min="1" max="480" className={inputCls} value={form.durationMinutes} onChange={e => set('durationMinutes', e.target.value)} />
          {errors.durationMinutes && <p className="text-xs text-rose-500 mt-1">{errors.durationMinutes}</p>}
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Intensity: {form.intensity}/10</label>
            <input type="range" min="1" max="10" className="w-full accent-indigo-600" value={form.intensity} onChange={e => set('intensity', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelCls}>Energy Rating: {form.energyRating}/10</label>
            <input type="range" min="1" max="10" className="w-full accent-indigo-600" value={form.energyRating} onChange={e => set('energyRating', Number(e.target.value))} />
          </div>
        </div>

        {/* Exercises */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls + ' mb-0'}>Exercises</label>
            <button type="button" onClick={addExercise} className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:opacity-80">
              <Plus className="w-3 h-3" /> Add Exercise
            </button>
          </div>

          {form.exercises.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 py-2">No exercises — tap &quot;Add Exercise&quot; to log your sets.</p>
          )}

          <div className="space-y-3">
            {form.exercises.map((ex, exIdx) => (
              <div key={ex.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 space-y-2">
                {/* Exercise name row */}
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Exercise name…"
                    list="exercise-names"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                    value={ex.name}
                    onChange={e => setExerciseName(exIdx, e.target.value)}
                  />
                  <button type="button" onClick={() => removeExercise(exIdx)} className="text-gray-400 hover:text-rose-500 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sets header */}
                <div className="grid grid-cols-4 gap-1.5 px-0.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Set</p>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">Reps</p>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">Weight</p>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">Unit</p>
                </div>

                {/* Set rows */}
                {ex.sets.map((s, sIdx) => (
                  <div key={sIdx} className="grid grid-cols-4 gap-1.5 items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium pl-0.5">{sIdx + 1}</span>
                    <input
                      type="number" min="1" max="999"
                      className={smallInputCls}
                      value={s.reps}
                      onChange={e => updateSet(exIdx, sIdx, 'reps', e.target.value)}
                    />
                    <input
                      type="number" min="0" step="0.5"
                      className={smallInputCls}
                      value={s.weight}
                      onChange={e => updateSet(exIdx, sIdx, 'weight', e.target.value)}
                    />
                    <div className="flex items-center gap-1">
                      <select
                        className="flex-1 px-1.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                        value={s.unit}
                        onChange={e => updateSet(exIdx, sIdx, 'unit', e.target.value)}
                      >
                        <option value="kg">kg</option>
                        <option value="lb">lb</option>
                      </select>
                      {ex.sets.length > 1 && (
                        <button type="button" onClick={() => removeSet(exIdx, sIdx)} className="text-gray-300 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addSet(exIdx)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:opacity-80 flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3 h-3" /> Add Set
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelCls}>Discomfort / Pain</label>
          <input type="text" placeholder="Any discomfort?" className={inputCls} value={form.discomfort} onChange={e => set('discomfort', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Notes</label>
          <textarea rows={2} placeholder="General notes…" className={inputCls} value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
            {initial ? 'Save Changes' : 'Log Workout'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
