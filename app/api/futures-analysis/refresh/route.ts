import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { analyzeFuturesVariety } from '@/lib/ai/futures-analysis'

const FUTURES_SOURCES = ['eafutures', 'ztqh', 'zlqh', 'thsfutures', 'emfutures', 'citicsf']

// Common futures varieties to analyze
const VARIETIES = [
  '螺纹钢', '热卷', '铁矿石', '焦炭', '焦煤',
  '铜', '铝', '锌', '镍', '锡',
  '原油', '天然气', '燃料油',
  '豆粕', '豆油', '大豆', '玉米', '小麦', '棉花', '白糖', '棕榈油',
  '黄金', '白银',
  '沪深300', '中证500',
]

export async function POST() {
  try {
    // Fetch recent articles from futures sources
    const articles = await prisma.newsArticle.findMany({
      where: {
        source: { in: FUTURES_SOURCES },
        publishedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { publishedAt: 'desc' },
      take: 200,
    })

    console.log('[futures-analysis/refresh] found', articles.length, 'articles')

    const results: string[] = []

    for (const variety of VARIETIES) {
      // Find articles mentioning this variety
      const relevant = articles.filter(
        (a) =>
          a.title.includes(variety) ||
          a.content.includes(variety)
      )

      if (relevant.length === 0) continue

      console.log('[futures-analysis/refresh] analyzing', variety, 'with', relevant.length, 'articles')

      const analysis = await analyzeFuturesVariety(
        variety,
        relevant.map((a) => ({ title: a.title, content: a.content, source: a.source }))
      )

      if (!analysis) continue

      await prisma.futuresVarietyAnalysis.upsert({
        where: { variety },
        create: {
          variety: analysis.variety,
          contradiction: analysis.contradiction,
          opportunity: analysis.opportunity,
          bullCase: analysis.bullCase,
          bearCase: analysis.bearCase,
          sentiment: analysis.sentiment,
        },
        update: {
          contradiction: analysis.contradiction,
          opportunity: analysis.opportunity,
          bullCase: analysis.bullCase,
          bearCase: analysis.bearCase,
          sentiment: analysis.sentiment,
        },
      })

      results.push(variety)
    }

    return NextResponse.json({ updated: results.length, varieties: results })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
