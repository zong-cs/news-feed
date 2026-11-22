import { NextRequest, NextResponse } from 'next/server'
import { refreshFuturesAnalysis } from '@/lib/futures/refresh'
import { isAdminRequest } from '@/lib/auth/admin'

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fire-and-forget: return immediately, run in background
  refreshFuturesAnalysis()
    .then(({ updated, varieties }) =>
      console.log(`[api/refresh] done — updated ${updated}: ${varieties.join(', ')}`)
    )
    .catch((err) => console.error('[api/refresh] error:', err))

  return NextResponse.json({ status: 'started' })
}
