'use client'

import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(defaultValue)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        setValue(JSON.parse(stored))
      }
    } catch {
      // JSON parse error — fall back to default
      setValue(defaultValue)
    }
    setHydrated(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const resolved = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue
      try {
        localStorage.setItem(key, JSON.stringify(resolved))
      } catch {
        // localStorage not available or quota exceeded
      }
      return resolved
    })
  }, [key])

  // Return defaultValue during SSR / before hydration to avoid mismatch
  return [hydrated ? value : defaultValue, setStoredValue]
}
