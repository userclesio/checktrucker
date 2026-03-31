import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const linkId = searchParams.get('linkId')
  const type = searchParams.get('type')
  const range = searchParams.get('range')
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  const where: Record<string, unknown> = {}
  if (linkId) where.linkId = linkId
  if (type && type !== 'all') where.type = type
  if (range && range !== 'all') {
    const cutoff = new Date()
    if (range === 'today') cutoff.setHours(0, 0, 0, 0)
    else if (range === '7d') cutoff.setDate(cutoff.getDate() - 7)
    else if (range === '30d') cutoff.setDate(cutoff.getDate() - 30)
    where.timestamp = { gte: cutoff }
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.event.count({ where }),
  ])

  return NextResponse.json({ events, total })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.linkId || !body.type) {
    return NextResponse.json({ error: 'linkId and type are required' }, { status: 400 })
  }

  const link = await prisma.link.findUnique({ where: { id: body.linkId } })
  if (!link) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 })
  }

  const event = await prisma.event.create({
    data: {
      linkId: body.linkId as string,
      type: body.type as string,
      source: body.source || null,
      metadata: body.metadata ?? {},
    },
  })

  return NextResponse.json(event, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const linkId = searchParams.get('linkId')

  if (linkId) {
    await prisma.event.deleteMany({ where: { linkId } })
  } else {
    await prisma.event.deleteMany({})
  }

  return NextResponse.json({ success: true })
}
