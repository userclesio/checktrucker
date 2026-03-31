import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const db = readDB()

  const idx = db.links.findIndex((l) => l.id === params.id)
  if (idx === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  db.links[idx] = {
    ...db.links[idx],
    name: body.name ?? db.links[idx].name,
    url: body.url ?? db.links[idx].url,
    pixelId: body.pixelId || undefined,
    fbToken: body.fbToken || undefined,
    value: body.value !== undefined ? parseFloat(body.value) || 0 : db.links[idx].value,
    currency: body.currency ?? db.links[idx].currency,
  }

  writeDB(db)

  return NextResponse.json(db.links[idx])
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = readDB()

  const idx = db.links.findIndex((l) => l.id === params.id)
  if (idx === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  db.links.splice(idx, 1)
  // Cascade delete events
  db.events = db.events.filter((e) => e.linkId !== params.id)
  writeDB(db)

  return NextResponse.json({ success: true })
}
