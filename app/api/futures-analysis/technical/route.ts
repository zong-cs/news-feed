import { NextResponse } from 'next/server'
import { refreshTechnicalAnalysis } from '@/lib/futures/technical-refresh'

export async function POST() {
  // Fire-and-forget: return immediately, run in background
  refreshTechnicalAnalysis()
    .then(({ updated, varieties }) =>
      console.log(`[api/technical] done — updated ${updated}: ${varieties.join(', ')}`)
    )
    .catch((err) => console.error('[api/technical] error:', err))

  return NextResponse.json({ status: 'started' })
}
