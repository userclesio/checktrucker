import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB } from '@/lib/db'
import { generateSlug, generateId } from '@/lib/slugify'

export async function GET() {
  const db = readDB()
  return NextResponse.json(db.links)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.name || !body.url) {
    return NextResponse.json({ error: 'name and url are required' }, { status: 400 })
  }

  const db = readDB()

  const newLink = {
    id: generateId(),
    slug: generateSlug(),
    name: body.name as string,
    url: body.url as string,
    pixelId: body.pixelId || undefined,
    fbToken: body.fbToken || undefined,
    value: parseFloat(body.value) || 0,
    currency: body.currency || 'BRL',
    createdAt: new Date().toISOString(),
  }

  db.links.push(newLink)
  writeDB(db)

  return NextResponse.json(newLink, { status: 201 })
}
