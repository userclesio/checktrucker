import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  try {
    const link = await prisma.link.update({
      where: { id: params.id },
      data: {
        name: body.name,
        url: body.url,
        pixelId: body.pixelId || null,
        fbToken: body.fbToken || null,
        value: body.value !== undefined ? parseFloat(body.value) || 0 : undefined,
        currency: body.currency,
      },
    })
    return NextResponse.json(link)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Cascade is handled by Prisma schema (onDelete: Cascade)
    await prisma.link.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
