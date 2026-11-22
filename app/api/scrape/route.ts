import { NextRequest, NextResponse } from 'next/server'
import { runScrapeJob } from '@/lib/news/scrape-job'
import { ALL_SOURCES } from '@/lib/scraper/sources'
import { isAdminRequest } from '@/lib/auth/admin'

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { source } = await req.json()

  if (!source || !ALL_SOURCES.includes(source)) {
    return NextResponse.json({ error: 'Invalid source' }, { status: 400 })
  }

  try {
    const result = await runScrapeJob(source)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
