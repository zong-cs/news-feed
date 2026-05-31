import { NextResponse } from 'next/server'
import { refreshFuturesAnalysis } from '@/lib/futures/refresh'

export async function POST() {
  // Fire-and-forget: return immediately, run in background
  refreshFuturesAnalysis()
    .then(({ updated, varieties }) =>
      console.log(`[api/refresh] done — updated ${updated}: ${varieties.join(', ')}`)
    )
    .catch((err) => console.error('[api/refresh] error:', err))

  return NextResponse.json({ status: 'started' })
}
