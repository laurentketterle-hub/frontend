'use client'

import { useMemo } from 'react'

export type RiskLevel = 'conservative' | 'moderate' | 'aggressive'

export interface Holding {
  symbol: string
  /** Credit rating, e.g. AAA, AA, A, BBB, BB, B. */
  rating: string
  /** Allocation weight (0-1). */
  weight: number
}

const RATING_SCORE: Record<string, number> = {
  AAA: 1, AA: 2, A: 3, BBB: 4, BB: 5, B: 6, CCC: 7, CC: 8, C: 9, D: 10,
}

export function ratingScore(rating: string): number {
  return RATING_SCORE[rating.toUpperCase()] ?? 5
}

export function levelFor(score: number): RiskLevel {
  if (score < 3) return 'conservative'
  if (score < 6) return 'moderate'
  return 'aggressive'
}

export interface PortfolioRiskScoreProps {
  holdings?: Holding[]
}

export function PortfolioRiskScore({ holdings = [] }: PortfolioRiskScoreProps) {
  const { score, level } = useMemo(() => {
    const total = holdings.reduce((sum, h) => sum + Math.max(0, h.weight), 0)
    if (total === 0) return { score: 0, level: 'conservative' as RiskLevel }
    const weighted = holdings.reduce((sum, h) => sum + ratingScore(h.rating) * Math.max(0, h.weight), 0)
    const avg = weighted / total
    return { score: avg, level: levelFor(avg) }
  }, [holdings])

  const pct = Math.max(0, Math.min(100, Math.round(((score - 1) / 9) * 100)))
  const color = level === 'conservative' ? '#16a34a' : level === 'moderate' ? '#f59e0b' : '#dc2626'

  return (
    <section style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, maxWidth: 400 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Portfolio risk score</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', border: '8px solid ' + color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700 }}>
          {score.toFixed(1)}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, textTransform: 'capitalize' }}>{level}</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
            Based on {holdings.length} holding{holdings.length === 1 ? '' : 's'} (scale 1–10)
          </p>
        </div>
      </div>
      <div style={{ marginTop: 12, height: 8, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: color }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
        <span>Conservative</span>
        <span>Moderate</span>
        <span>Aggressive</span>
      </div>
    </section>
  )
}
