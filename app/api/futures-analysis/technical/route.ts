import { NextResponse } from 'next/server'
import { refreshTechnicalAnalysis } from '@/lib/futures/technical-refresh'

export const maxDuration = 300

export async function POST() {
  try {
    const result = await refreshTechnicalAnalysis()
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
