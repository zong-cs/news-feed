import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Macro/market sources that represent broad market news
const MACRO_SOURCES = [
  'reuters', 'ft', 'bloomberg', 'cnbc', 'marketwatch',
  'cls', 'eastmoney', 'wallstreetcn', 'sina', 'stcn',
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '6'), 20)

  const articles = await prisma.newsArticle.findMany({
    where: {
      source: { in: MACRO_SOURCES },
      aiProcessed: true,
      sentiment: { not: null },
      publishedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      url: true,
      title: true,
      summary: true,
      sentiment: true,
      source: true,
      publishedAt: true,
    },
  })

  return NextResponse.json(articles)
}
