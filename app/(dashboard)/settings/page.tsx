'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/Toast'

export default function SettingsPage() {
  const [pixelId, setPixelId] = useState('')
  const [fbToken, setFbToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setPixelId(data.pixelId ?? '')
        setFbToken(data.fbToken ?? '')
        setLoading(false)
      })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pixelId: pixelId.trim(), fbToken: fbToken.trim() }),
    })

    setSaving(false)

    if (res.ok) {
      showToast('Settings saved', 'success')
    } else {
      showToast('Failed to save settings', 'error')
    }
  }

  const inputClass =
    'w-full bg-base border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder-muted focus:outline-none focus:border-white/20 transition-colors font-mono'
  const labelClass = 'block text-xs font-semibold text-muted mb-2 uppercase tracking-widest'

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
        <p className="text-sm text-muted mt-1">
          Global defaults — overridden by per-link settings
        </p>
      </div>

      {/* TODO: Add authentication settings here — email/password via NextAuth.js */}

      {loading ? (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center">
          <p className="text-muted text-sm">Loading…</p>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
            {/* Section header */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(184,247,36,0.1)' }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="1" y="4" width="16" height="11" rx="2" stroke="#b8f724" strokeWidth="1.4"/>
                  <path d="M1 7h16" stroke="#b8f724" strokeWidth="1.4"/>
                  <circle cx="4.5" cy="11" r="1" fill="#b8f724"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Facebook Pixel</p>
                <p className="text-xs text-muted">Used when a link has no own pixel configured</p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Global Pixel ID</label>
              <input
                className={inputClass}
                placeholder="123456789012345"
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
              />
              <p className="text-xs text-muted mt-2">
                Your Facebook Pixel ID (15-digit number)
              </p>
            </div>

            <div>
              <label className={labelClass}>Conversions API Token</label>
              <input
                className={inputClass}
                type="password"
                placeholder="EAAxxxxxxxxxxxxxxx"
                value={fbToken}
                onChange={(e) => setFbToken(e.target.value)}
              />
              <p className="text-xs text-muted mt-2">
                Your Meta Conversions API access token. Kept server-side — never exposed to the browser.
              </p>
            </div>

            {/* Status indicators */}
            <div className="flex gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: pixelId ? '#b8f724' : '#333' }}
                />
                <span className="text-xs text-muted">
                  {pixelId ? 'Pixel configured' : 'No pixel set'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: fbToken ? '#b8f724' : '#333' }}
                />
                <span className="text-xs text-muted">
                  {fbToken ? 'Conversions API configured' : 'No API token set'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{ background: '#b8f724', color: '#000' }}
            >
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}

      {/* Info card */}
      <div className="mt-6 bg-surface border border-border rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-widest text-muted font-semibold mb-3">
          How it works
        </p>
        <ul className="space-y-2 text-xs text-muted">
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">→</span>
            Each render page (<span className="font-mono text-primary">/r/slug</span>) embeds
            your checkout URL in a full-screen iframe
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">→</span>
            <strong className="text-primary">PageView</strong> and{' '}
            <strong className="text-primary">InitiateCheckout</strong> fire immediately on page
            load via browser pixel + Conversions API
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">→</span>
            <strong className="text-primary">Purchase</strong> is detected via postMessage, iframe
            reload, or URL params
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">→</span>
            API tokens are never sent to the client — all Conversions API calls go through{' '}
            <span className="font-mono text-primary">/api/fb-conversion</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
