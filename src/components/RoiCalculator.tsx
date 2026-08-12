'use client'

import { useMemo, useState } from 'react'

export interface RoiCalculatorProps {
  /** Annual yield in percent (e.g. 6.5 for 6.5%). */
  annualYield?: number
  /** Compounding periods per year (default 1). */
  compoundsPerYear?: number
  /** Maturity windows in years (default 1/5/10). */
  horizons?: number[]
}

function project(principal: number, ratePct: number, years: number, compounds: number): number {
  if (principal <= 0 || ratePct < 0 || years < 0) return 0
  const r = ratePct / 100
  if (compounds <= 0) return principal * (1 + r * years)
  return principal * Math.pow(1 + r / compounds, compounds * years)
}

export function RoiCalculator({
  annualYield = 6.5,
  compoundsPerYear = 1,
  horizons = [1, 5, 10],
}: RoiCalculatorProps) {
  const [amount, setAmount] = useState('1000')
  const principal = Number(amount)
  const valid = Number.isFinite(principal) && principal > 0

  const projections = useMemo(() => {
    if (!valid) return []
    return horizons.map((years) => {
      const future = project(principal, annualYield, years, compoundsPerYear)
      return { years, future, roi: ((future - principal) / principal) * 100 }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, annualYield, compoundsPerYear, valid])

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <section style={{ padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, maxWidth: 380 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Rate of return calculator</h3>
      <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
        Investment amount
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder="1000"
          style={{ display: 'block', width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, marginTop: 4 }}
        />
      </label>
      {valid ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '6px 4px' }}>Horizon</th>
              <th style={{ textAlign: 'right', padding: '6px 4px' }}>Projected</th>
              <th style={{ textAlign: 'right', padding: '6px 4px' }}>ROI</th>
            </tr>
          </thead>
          <tbody>
            {projections.map((p) => (
              <tr key={p.years}>
                <td style={{ padding: '6px 4px' }}>{p.years} yr</td>
                <td style={{ textAlign: 'right', padding: '6px 4px' }}>{fmt(p.future)}</td>
                <td style={{ textAlign: 'right', padding: '6px 4px', color: p.roi >= 0 ? '#16a34a' : '#dc2626' }}>
                  +{p.roi.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ fontSize: 13, color: '#9ca3af' }}>Enter a positive amount to see projections.</p>
      )}
      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 12 }}>
        Assumes {annualYield}% annual yield, compounded {compoundsPerYear}x/year.
      </p>
    </section>
  )
}
