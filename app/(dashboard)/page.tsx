'use client'

import { useState, useEffect, useCallback } from 'react'
import MetricCard from '@/components/MetricCard'
import EventLog from '@/components/EventLog'
import type { Link, Event } from '@/lib/db'

type Range = 'today' | '7d' | '30d' | 'all'

const RANGE_LABELS: Record<Range, string> = {
  today: 'Today',
  '7d': '7 days',
  '30d': '30 days',
  all: 'All time',
}

export default function DashboardPage() {
  const [links, setLinks] = useState<Link[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [range, setRange] = useState<Range>('7d')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [linksRes, eventsRes] = await Promise.all([
      fetch('/api/links').then((r) => r.json()),
      fetch(`/api/events?range=${range}&limit=50`).then((r) => r.json()),
    ])
    setLinks(linksRes)
    setEvents(eventsRes.events ?? [])
    setLoading(false)
  }, [range])

  useEffect(() => {
    load()
  }, [load])

  const pageviews = events.filter((e) => e.type === 'PageView').length
  const checkouts = events.filter((e) => e.type === 'InitiateCheckout').length
  const purchases = events.filter((e) => e.type === 'Purchase').length
  const convRate =
    checkouts > 0 ? ((purchases / checkouts) * 100).toFixed(1) + '%' : '0%'

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Overview of all your checkout links</p>
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
          {(Object.entries(RANGE_LABELS) as [Range, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: range === key ? '#b8f724' : 'transparent',
                color: range === key ? '#000' : '#888',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        <MetricCard label="Total Links" value={loading ? '—' : links.length} />
        <MetricCard label="Page Views" value={loading ? '—' : pageviews} />
        <MetricCard label="Checkouts" value={loading ? '—' : checkouts} />
        <MetricCard label="Purchases" value={loading ? '—' : purchases} />
        <MetricCard
          label="Conv. Rate"
          value={loading ? '—' : convRate}
          accent
          sublabel="Purchases / Checkouts"
        />
      </div>

      {/* Recent events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-primary">Recent Events</h2>
          {events.length > 0 && (
            <span className="text-xs text-muted">{events.length} shown</span>
          )}
        </div>
        {loading ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <p className="text-muted text-sm">Loading…</p>
          </div>
        ) : (
          <EventLog events={events} links={links} showLink />
        )}
      </div>
    </div>
  )
}
