import { NextRequest, NextResponse } from 'next/server'
import { fetchVarietyKData } from '@/lib/market/ths'

export async function GET(req: NextRequest) {
  const variety = req.nextUrl.searchParams.get('variety')
  if (!variety) return NextResponse.json({ error: 'missing variety' }, { status: 400 })

  const data = await fetchVarietyKData(variety)
  if (!data) return NextResponse.json({ error: 'no data' }, { status: 404 })

  return NextResponse.json({
    variety: data.variety,
    symbol: data.symbol,
    daily: data.daily,
    weekly: data.weekly,
  })
}
