'use client'

import { useMemo } from 'react'

export interface PricePoint {
  /** Label for the x-axis (date or period). */
  t: string
  price: number
  yield?: number
}

export interface HistoricalPriceChartProps {
  data: PricePoint[]
  height?: number
  width?: number
  /** Plot yield instead of price. */
  showYield?: boolean
}

export function HistoricalPriceChart({ data, height = 200, width = 640, showYield = false }: HistoricalPriceChartProps) {
  const { points, lo, hi } = useMemo(() => {
    if (data.length === 0) return { points: [], lo: 0, hi: 0 }
    const values = data.map((d) => (showYield && d.yield !== undefined ? d.yield : d.price))
    const mn = Math.min(...values)
    const mx = Math.max(...values)
    const pad = (mx - mn) * 0.1 || 1
    const lo = mn - pad
    const hi = mx + pad
    const points = data.map((d, i) => {
      const v = showYield && d.yield !== undefined ? d.yield : d.price
      const x = (i / Math.max(1, data.length - 1)) * width
      const y = height - ((v - lo) / (hi - lo)) * height
      return { ...d, x, y, v }
    })
    return { points, lo, hi }
  }, [data, height, width, showYield])

  if (points.length === 0) {
    return <p style={{ fontSize: 13, color: '#9ca3af' }}>No history available.</p>
  }

  const line = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(2) + ' ' + p.y.toFixed(2)).join(' ')
  const area = line + ' L ' + width + ' ' + height + ' L 0 ' + height + ' Z'

  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={'0 0 ' + width + ' ' + height} width="100%" height={height} role="img" aria-label={'Bond ' + (showYield ? 'yield' : 'price') + ' history chart'}>
        <defs>
          <linearGradient id="hpc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#hpc-fill)" />
        <path d={line} fill="none" stroke="#f59e0b" strokeWidth={2} />
        {points.map((p) => (
          <circle key={p.t} cx={p.x} cy={p.y} r={3} fill="#f59e0b" />
        ))}
      </svg>
      <figcaption style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
        <span>{data[0].t}</span>
        <span>
          {showYield ? 'yield' : 'price'} range: {lo.toFixed(2)} – {hi.toFixed(2)}
        </span>
        <span>{data[data.length - 1].t}</span>
      </figcaption>
    </figure>
  )
}
