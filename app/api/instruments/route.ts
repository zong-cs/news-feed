import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const instruments = await prisma.tradingInstrument.findMany({
    include: {
      _count: { select: { articles: true } },
    },
    orderBy: {
      articles: { _count: 'desc' },
    },
  })

  return NextResponse.json(instruments)
}
