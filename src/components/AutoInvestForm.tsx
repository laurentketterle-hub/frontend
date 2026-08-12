'use client'

import { useCallback, useState, type FormEvent } from 'react'

export type AutoInvestFrequency = 'monthly' | 'weekly'

export interface AutoInvestSchedule {
  id: string
  bondSymbol: string
  amount: number
  frequency: AutoInvestFrequency
  createdAt: string
}

const STORAGE_KEY = 'heliobond-auto-invest'

function loadSchedules(): AutoInvestSchedule[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AutoInvestSchedule[]) : []
  } catch {
    return []
  }
}

export interface AutoInvestFormProps {
  /** Available bond symbols (optional). */
  bonds?: string[]
  onSchedule?: (schedule: AutoInvestSchedule) => void
}

export function AutoInvestForm({ bonds = [], onSchedule }: AutoInvestFormProps) {
  const [schedules, setSchedules] = useState<AutoInvestSchedule[]>(loadSchedules)
  const [bondSymbol, setBondSymbol] = useState(bonds[0] ?? '')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<AutoInvestFrequency>('monthly')
  const [error, setError] = useState('')

  const persist = useCallback((next: AutoInvestSchedule[]) => {
    setSchedules(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }, [])

  const submit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const value = Number(amount)
      if (!bondSymbol) {
        setError('Select a bond')
        return
      }
      if (!Number.isFinite(value) || value <= 0) {
        setError('Enter a positive amount')
        return
      }
      const schedule: AutoInvestSchedule = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        bondSymbol,
        amount: value,
        frequency,
        createdAt: new Date().toISOString(),
      }
      persist([...schedules, schedule])
      onSchedule?.(schedule)
      setAmount('')
      setError('')
    },
    [bondSymbol, amount, frequency, schedules, persist, onSchedule],
  )

  const remove = useCallback(
    (id: string) => persist(schedules.filter((s) => s.id !== id)),
    [schedules, persist],
  )

  const field: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }

  return (
    <section style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, maxWidth: 400 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Recurring investment</h3>
      <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
        <label style={{ fontSize: 12, color: '#6b7280' }}>
          Bond
          {bonds.length > 0 ? (
            <select value={bondSymbol} onChange={(e) => setBondSymbol(e.target.value)} style={field}>
              {bonds.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          ) : (
            <input value={bondSymbol} onChange={(e) => setBondSymbol(e.target.value)} placeholder="XYZ" style={field} />
          )}
        </label>
        <label style={{ fontSize: 12, color: '#6b7280' }}>
          Amount
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="100" style={field} />
        </label>
        <label style={{ fontSize: 12, color: '#6b7280' }}>
          Frequency
          <select value={frequency} onChange={(e) => setFrequency(e.target.value as AutoInvestFrequency)} style={field}>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
        {error && <p style={{ margin: 0, fontSize: 12, color: '#dc2626' }}>{error}</p>}
        <button type="submit" style={{ padding: '10px', borderRadius: 999, border: 'none', background: '#f59e0b', color: '#111827', fontWeight: 600, cursor: 'pointer' }}>
          Start recurring investment
        </button>
      </form>

      {schedules.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'grid', gap: 6 }}>
          {schedules.map((s) => (
            <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span>
                {s.bondSymbol} · {s.amount} / {s.frequency}
              </span>
              <button type="button" onClick={() => remove(s.id)} aria-label={'Remove ' + s.bondSymbol + ' schedule'} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer' }}>
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
