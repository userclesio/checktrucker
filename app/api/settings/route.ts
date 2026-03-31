import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, pixelId: '', fbToken: '' },
  })
  return NextResponse.json(settings)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()

  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {
      pixelId: body.pixelId ?? '',
      fbToken: body.fbToken ?? '',
    },
    create: { id: 1, pixelId: body.pixelId ?? '', fbToken: body.fbToken ?? '' },
  })

  return NextResponse.json(settings)
}
