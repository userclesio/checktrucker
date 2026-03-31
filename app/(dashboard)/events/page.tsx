'use client'

import { useState, useEffect, useCallback } from 'react'
import EventLog from '@/components/EventLog'
import { useToast } from '@/components/Toast'
import type { Link, Event } from '@/lib/db'

type Range = 'today' | '7d' | '30d' | 'all'
type EventType = 'all' | 'PageView' | 'InitiateCheckout' | 'Purchase'

const RANGE_LABELS: Record<Range, string> = {
  today: 'Today',
  '7d': '7 days',
  '30d': '30 days',
  all: 'All time',
}

const PAGE_SIZE = 50

export default function EventsPage() {
  const [links, setLinks] = useState<Link[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)

  const [range, setRange] = useState<Range>('7d')
  const [eventType, setEventType] = useState<EventType>('all')
  const [linkId, setLinkId] = useState<string>('all')
  const [offset, setOffset] = useState(0)

  const { showToast } = useToast()

  const loadLinks = useCallback(async () => {
    const res = await fetch('/api/links')
    setLinks(await res.json())
  }, [])

  const loadEvents = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      range,
      limit: PAGE_SIZE.toString(),
      offset: offset.toString(),
    })
    if (eventType !== 'all') params.set('type', eventType)
    if (linkId !== 'all') params.set('linkId', linkId)

    const res = await fetch(`/api/events?${params}`)
    const data = await res.json()
    setEvents(data.events ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [range, eventType, linkId, offset])

  useEffect(() => {
    loadLinks()
  }, [loadLinks])

  useEffect(() => {
    setOffset(0)
  }, [range, eventType, linkId])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const clearEvents = async () => {
    const target = linkId !== 'all' ? 'events for this link' : 'all events'
    if (!confirm(`Clear ${target}? This cannot be undone.`)) return

    setClearing(true)
    const url = linkId !== 'all' ? `/api/events?linkId=${linkId}` : '/api/events'
    const res = await fetch(url, { method: 'DELETE' })

    if (res.ok) {
      showToast('Events cleared', 'success')
      loadEvents()
    } else {
      showToast('Failed to clear events', 'error')
    }
    setClearing(false)
  }

  const selectClass =
    'bg-surface border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-white/20 transition-colors'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Events</h1>
          <p className="text-sm text-muted mt-1">{total} total events matching filters</p>
        </div>
        <button
          onClick={clearEvents}
          disabled={clearing || total === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-border text-muted hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-40"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1.5 3.5h11M5 3.5V2h4v1.5M5.5 6v4M8.5 6v4M2.5 3.5l.8 8.5h5.4l.8-8.5H2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {clearing ? 'Clearing…' : 'Clear Events'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Time range */}
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

        {/* Event type */}
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value as EventType)}
          className={selectClass}
        >
          <option value="all">All event types</option>
          <option value="PageView">Page View</option>
          <option value="InitiateCheckout">Initiate Checkout</option>
          <option value="Purchase">Purchase</option>
        </select>

        {/* Link filter */}
        <select
          value={linkId}
          onChange={(e) => setLinkId(e.target.value)}
          className={selectClass}
        >
          <option value="all">All links</option>
          {links.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Events table */}
      {loading ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-muted text-sm">Loading…</p>
        </div>
      ) : (
        <>
          <EventLog events={events} links={links} showLink />

          {/* Pagination */}
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted">
                Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={offset === 0}
                  onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                  className="px-4 py-2 rounded-lg text-sm border border-border text-muted hover:text-primary disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={offset + PAGE_SIZE >= total}
                  onClick={() => setOffset((o) => o + PAGE_SIZE)}
                  className="px-4 py-2 rounded-lg text-sm border border-border text-muted hover:text-primary disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
