import { NextRequest, NextResponse } from 'next/server'
import { sendFBConversion } from '@/lib/pixel'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { pixelId, fbToken, eventName, eventData } = body

  if (!pixelId || !fbToken || !eventName) {
    return NextResponse.json(
      { error: 'pixelId, fbToken, and eventName are required' },
      { status: 400 }
    )
  }

  try {
    await sendFBConversion({ pixelId, fbToken, eventName, eventData })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('FB Conversions API error:', err)
    return NextResponse.json({ error: 'FB API call failed' }, { status: 500 })
  }
}
