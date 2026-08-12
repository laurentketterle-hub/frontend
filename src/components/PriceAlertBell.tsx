'use client'

import { useCallback, useState, type FormEvent } from 'react'

export type AlertMetric = 'yield' | 'price'
export type AlertDirection = 'above' | 'below'

export interface PriceAlert {
  id: string
  symbol: string
  threshold: number
  direction: AlertDirection
  metric: AlertMetric
  createdAt: string
}

const STORAGE_KEY = 'heliobond-price-alerts'

function loadAlerts(): PriceAlert[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PriceAlert[]) : []
  } catch {
    return []
  }
}

export interface PriceAlertBellProps {
  /** Current values keyed by bond symbol; used to evaluate which alerts fire. */
  quotes?: Record<string, number>
  onNotify?: (alert: PriceAlert, value: number) => void
}

export function PriceAlertBell({ quotes = {}, onNotify }: PriceAlertBellProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(loadAlerts)
  const [open, setOpen] = useState(false)
  const [symbol, setSymbol] = useState('')
  const [threshold, setThreshold] = useState('')
  const [direction, setDirection] = useState<AlertDirection>('above')
  const [metric, setMetric] = useState<AlertMetric>('yield')

  const persist = useCallback((next: PriceAlert[]) => {
    setAlerts(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }, [])

  const addAlert = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const value = Number(threshold)
      if (!symbol.trim() || Number.isNaN(value) || value < 0) return
      const alert: PriceAlert = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        symbol: symbol.trim().toUpperCase(),
        threshold: value,
        direction,
        metric,
        createdAt: new Date().toISOString(),
      }
      persist([...alerts, alert])
      setSymbol('')
      setThreshold('')
    },
    [alerts, symbol, threshold, direction, metric, persist],
  )

  const removeAlert = useCallback(
    (id: string) => persist(alerts.filter((a) => a.id !== id)),
    [alerts, persist],
  )

  const fired = alerts.filter((a) => {
    const current = quotes[a.symbol]
    if (current === undefined) return false
    const hit = a.direction === 'above' ? current > a.threshold : current < a.threshold
    if (hit) onNotify?.(a, current)
    return hit
  })

  const field: React.CSSProperties = { width: '100%', padding: '6px 8px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        aria-label="Price alerts"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%', border: '1px solid #d1d5db', background: '#ffffff', cursor: 'pointer', fontSize: 18 }}
      >
        <span aria-hidden="true">{'\u{1F514}'}</span>
        {fired.length > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 999, background: '#dc2626', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
            {fired.length}
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label="Price alerts" style={{ position: 'absolute', top: 48, right: 0, width: 300, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: 16, zIndex: 50 }}>
          <form onSubmit={addAlert} style={{ display: 'grid', gap: 8 }}>
            <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Bond symbol (e.g. XYZ)" aria-label="Bond symbol" style={field} />
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={metric} onChange={(e) => setMetric(e.target.value as AlertMetric)} aria-label="Metric" style={field}>
                <option value="yield">Yield</option>
                <option value="price">Price</option>
              </select>
              <select value={direction} onChange={(e) => setDirection(e.target.value as AlertDirection)} aria-label="Direction" style={field}>
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
            </div>
            <input value={threshold} onChange={(e) => setThreshold(e.target.value)} inputMode="decimal" placeholder="Threshold (%) e.g. 5" aria-label="Threshold" style={field} />
            <button type="submit" style={{ padding: '8px 12px', borderRadius: 999, border: 'none', background: '#f59e0b', color: '#111827', fontWeight: 600, cursor: 'pointer' }}>
              Add alert
            </button>
          </form>

          {alerts.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 12 }}>No alerts yet. Add one to get notified.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'grid', gap: 6 }}>
              {alerts.map((a) => (
                <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span>{a.symbol} {a.metric} {a.direction} {a.threshold}%</span>
                  <button type="button" onClick={() => removeAlert(a.id)} aria-label={'Remove ' + a.symbol + ' alert'} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer' }}>
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
