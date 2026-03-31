'use client'

import { Link, Event } from '@/lib/db'
import { useToast } from './Toast'

interface LinkCardProps {
  link: Link
  events: Event[]
  onEdit: (link: Link) => void
  onDelete: (id: string) => void
}

const EVENT_COLORS: Record<string, string> = {
  PageView: '#888',
  InitiateCheckout: '#f59e0b',
  Purchase: '#b8f724',
}

export default function LinkCard({ link, events, onEdit, onDelete }: LinkCardProps) {
  const { showToast } = useToast()

  const pageviews = events.filter((e) => e.type === 'PageView').length
  const checkouts = events.filter((e) => e.type === 'InitiateCheckout').length
  const purchases = events.filter((e) => e.type === 'Purchase').length
  const convRate =
    checkouts > 0 ? ((purchases / checkouts) * 100).toFixed(0) + '%' : '—'

  const renderUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/r/${link.slug}`
      : `/r/${link.slug}`

  const copyUrl = () => {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/r/${link.slug}`
        : `/r/${link.slug}`
    navigator.clipboard.writeText(url).then(() => showToast('Render URL copied!', 'success'))
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5 hover:border-white/10 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-primary truncate">{link.name}</h3>
          <p className="text-xs text-muted mt-0.5 truncate max-w-[240px]">{link.url}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onEdit(link)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-white/5 transition-colors"
            title="Edit link"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9.5 2.5l2 2L4.5 11.5H2.5v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => onDelete(link.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete link"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1.5 3.5h11M5 3.5V2h4v1.5M5.5 6v4M8.5 6v4M2.5 3.5l.8 8.5h5.4l.8-8.5H2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Views', value: pageviews, color: EVENT_COLORS.PageView },
          { label: 'Checkouts', value: checkouts, color: EVENT_COLORS.InitiateCheckout },
          { label: 'Purchases', value: purchases, color: EVENT_COLORS.Purchase },
          { label: 'Conv.', value: convRate, color: '#e8e5e0' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-base rounded-lg p-2.5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted font-semibold mb-1">
              {label}
            </p>
            <p className="text-sm font-bold tabular-nums" style={{ color }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Slug / render URL */}
      <div className="flex items-center gap-2 bg-base rounded-lg px-3 py-2">
        <span className="text-xs text-muted font-mono flex-1 truncate">/r/{link.slug}</span>
        <button
          onClick={copyUrl}
          className="text-[11px] font-semibold transition-colors flex-shrink-0 flex items-center gap-1"
          style={{ color: '#b8f724' }}
          title="Copy render URL"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M3 8H2a1 1 0 01-1-1V2a1 1 0 011-1h5a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          Copy
        </button>
        <a
          href={`/r/${link.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-primary transition-colors flex-shrink-0"
          title="Open render page"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7M7 1h4m0 0v4m0-4L5.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </a>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-[10px] bg-base border border-border rounded px-2 py-1 text-muted font-mono">
          {link.currency} {link.value > 0 ? link.value.toFixed(2) : '—'}
        </span>
        {link.pixelId && (
          <span className="text-[10px] bg-base border border-border rounded px-2 py-1 text-muted font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
            Pixel {link.pixelId.slice(0, 6)}…
          </span>
        )}
        {!link.pixelId && (
          <span className="text-[10px] bg-base border border-border rounded px-2 py-1 text-muted">
            Global pixel
          </span>
        )}
      </div>
    </div>
  )
}
