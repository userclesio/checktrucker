import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slugify'

export const dynamic = 'force-dynamic'

export async function GET() {
  const links = await prisma.link.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(links)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.name || !body.url) {
    return NextResponse.json({ error: 'name and url are required' }, { status: 400 })
  }

  const link = await prisma.link.create({
    data: {
      slug: generateSlug(),
      name: body.name as string,
      url: body.url as string,
      pixelId: body.pixelId || null,
      fbToken: body.fbToken || null,
      value: parseFloat(body.value) || 0,
      currency: body.currency || 'BRL',
    },
  })

  return NextResponse.json(link, { status: 201 })
}
