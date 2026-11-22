import { NextRequest, NextResponse } from 'next/server'
import { refreshTechnicalAnalysis } from '@/lib/futures/technical-refresh'
import { isAdminRequest } from '@/lib/auth/admin'

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fire-and-forget: return immediately, run in background
  refreshTechnicalAnalysis()
    .then(({ updated, varieties }) =>
      console.log(`[api/technical] done — updated ${updated}: ${varieties.join(', ')}`)
    )
    .catch((err) => console.error('[api/technical] error:', err))

  return NextResponse.json({ status: 'started' })
}
