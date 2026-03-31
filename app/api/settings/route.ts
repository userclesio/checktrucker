import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB } from '@/lib/db'

export async function GET() {
  const db = readDB()
  return NextResponse.json(db.settings)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const db = readDB()

  db.settings = {
    pixelId: body.pixelId ?? db.settings.pixelId,
    fbToken: body.fbToken ?? db.settings.fbToken,
  }

  writeDB(db)

  return NextResponse.json(db.settings)
}
