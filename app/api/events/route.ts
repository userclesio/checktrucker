import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB } from '@/lib/db'
import { generateId } from '@/lib/slugify'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const linkId = searchParams.get('linkId')
  const type = searchParams.get('type')
  const range = searchParams.get('range') // today | 7d | 30d | all
  const limitParam = searchParams.get('limit')
  const offsetParam = searchParams.get('offset')

  const db = readDB()
  let events = [...db.events]

  if (linkId) events = events.filter((e) => e.linkId === linkId)
  if (type && type !== 'all') events = events.filter((e) => e.type === type)

  if (range && range !== 'all') {
    const now = new Date()
    const cutoff = new Date()
    if (range === 'today') cutoff.setHours(0, 0, 0, 0)
    else if (range === '7d') cutoff.setDate(now.getDate() - 7)
    else if (range === '30d') cutoff.setDate(now.getDate() - 30)
    events = events.filter((e) => new Date(e.timestamp) >= cutoff)
  }

  // Sort newest first
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const total = events.length

  if (offsetParam) events = events.slice(parseInt(offsetParam))
  if (limitParam) events = events.slice(0, parseInt(limitParam))

  return NextResponse.json({ events, total })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.linkId || !body.type) {
    return NextResponse.json({ error: 'linkId and type are required' }, { status: 400 })
  }

  const db = readDB()

  // Verify link exists
  const link = db.links.find((l) => l.id === body.linkId)
  if (!link) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 })
  }

  const newEvent = {
    id: generateId(),
    linkId: body.linkId as string,
    type: body.type as 'PageView' | 'InitiateCheckout' | 'Purchase',
    source: body.source || undefined,
    timestamp: new Date().toISOString(),
    metadata: body.metadata || {},
  }

  db.events.push(newEvent)
  writeDB(db)

  return NextResponse.json(newEvent, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const linkId = searchParams.get('linkId')

  const db = readDB()

  if (linkId) {
    db.events = db.events.filter((e) => e.linkId !== linkId)
  } else {
    db.events = []
  }

  writeDB(db)

  return NextResponse.json({ success: true })
}
