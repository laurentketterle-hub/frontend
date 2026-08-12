'use client'

import { useCallback, useState } from 'react'

export interface ReferralShareProps {
  /** Referral code/slug. Empty means no referral exists yet. */
  referralCode?: string
  /** Base URL for the share link (defaults to current origin). */
  baseUrl?: string
  rewardText?: string
}

export function ReferralShare({ referralCode = '', baseUrl, rewardText = 'Earn a bonus when friends invest' }: ReferralShareProps) {
  const [copied, setCopied] = useState(false)
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  const link = referralCode ? base + '/?ref=' + encodeURIComponent(referralCode) : ''

  const copy = useCallback(async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard may be blocked — no-op */
    }
  }, [link])

  const share = useCallback(async () => {
    if (!link) return
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Heliobond', text: rewardText, url: link })
      } catch {
        /* user cancelled */
      }
    } else {
      await copy()
    }
  }, [link, copy, rewardText])

  if (!referralCode) {
    return <p style={{ fontSize: 13, color: '#9ca3af' }}>No referral link yet.</p>
  }

  return (
    <div style={{ padding: 16, border: '1px dashed #f59e0b', borderRadius: 12, maxWidth: 420 }}>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>{rewardText}</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input readOnly value={link} aria-label="Referral link" style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, background: '#f9fafb' }} />
        <button type="button" onClick={copy} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 13 }}>
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button type="button" onClick={share} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#f59e0b', color: '#111827', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Share
        </button>
      </div>
    </div>
  )
}
