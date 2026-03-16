import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const source = searchParams.get('source') ?? undefined
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)

  const articles = await prisma.newsArticle.findMany({
    where: source ? { source } : undefined,
    orderBy: { publishedAt: 'desc' },
    take: limit,
    include: {
      instruments: {
        include: { instrument: true },
      },
    },
  })

  return NextResponse.json(articles)
}
