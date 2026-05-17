import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? undefined

  const instruments = await prisma.tradingInstrument.findMany({
    where: type ? { type } : undefined,
    include: {
      _count: { select: { articles: true } },
    },
    orderBy: {
      articles: { _count: 'desc' },
    },
  })

  return NextResponse.json(instruments)
}
