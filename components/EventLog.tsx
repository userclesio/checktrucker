'use client'

import { Link, Event } from '@/lib/db'

interface EventLogProps {
  events: Event[]
  links?: Link[]
  showLink?: boolean
}

const EVENT_DOT: Record<string, string> = {
  PageView: '#888888',
  InitiateCheckout: '#f59e0b',
  Purchase: '#b8f724',
}

const EVENT_LABEL: Record<string, string> = {
  PageView: 'Page View',
  InitiateCheckout: 'Initiate Checkout',
  Purchase: 'Purchase',
}

function formatTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export default function EventLog({ events, links = [], showLink = false }: EventLogProps) {
  const getLinkName = (linkId: string) => {
    return links.find((l) => l.id === linkId)?.name ?? linkId.slice(0, 8) + '...'
  }

  if (events.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-8 text-center">
        <p className="text-muted text-sm">No events yet</p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[11px] uppercase tracking-widest text-muted font-semibold px-4 py-3">
                Event
              </th>
              {showLink && (
                <th className="text-left text-[11px] uppercase tracking-widest text-muted font-semibold px-4 py-3">
                  Link
                </th>
              )}
              <th className="text-left text-[11px] uppercase tracking-widest text-muted font-semibold px-4 py-3">
                Source
              </th>
              <th className="text-left text-[11px] uppercase tracking-widest text-muted font-semibold px-4 py-3">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                className="border-b border-border/50 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: EVENT_DOT[event.type] ?? '#888' }}
                    />
                    <span className="text-primary font-medium">
                      {EVENT_LABEL[event.type] ?? event.type}
                    </span>
                  </div>
                </td>
                {showLink && (
                  <td className="px-4 py-3 text-muted">{getLinkName(event.linkId)}</td>
                )}
                <td className="px-4 py-3 text-muted capitalize">
                  {event.source ?? '—'}
                </td>
                <td className="px-4 py-3 text-muted font-mono text-xs tabular-nums">
                  {formatTime(event.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
