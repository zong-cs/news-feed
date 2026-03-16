import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params

  const instrument = await prisma.tradingInstrument.findUnique({
    where: { symbol: decodeURIComponent(symbol) },
    include: {
      articles: {
        include: { article: true },
        orderBy: { article: { publishedAt: 'desc' } },
        take: 50,
      },
    },
  })

  if (!instrument) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(instrument)
}
