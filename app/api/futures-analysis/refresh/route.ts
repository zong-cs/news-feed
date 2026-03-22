import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { analyzeFuturesVariety } from '@/lib/ai/futures-analysis'

const FUTURES_SOURCES = ['eafutures', 'ztqh', 'zlqh', 'thsfutures', 'emfutures', 'citicsf']

const SECTOR_VARIETIES: Record<string, string[]> = {
  '黑色金属': ['螺纹钢', '热卷', '铁矿石', '焦炭', '焦煤', '硅铁', '锰硅', '不锈钢', '铁合金'],
  '有色金属': ['铜', '铝', '锌', '铅', '镍', '锡', '氧化铝', '工业硅', '碳酸锂'],
  '化工': ['原油', '燃料油', '沥青', '甲醇', '乙二醇', 'PTA', '苯乙烯', 'PVC', '聚丙烯', '聚乙烯', '橡胶', '合成橡胶', '丁二烯橡胶', '纯碱', '烧碱', '尿素'],
  '农产品': ['豆粕', '豆油', '大豆', '玉米', '小麦', '棉花', '白糖', '棕榈油', '菜粕', '菜油', '花生', '鸡蛋', '生猪', '苹果', '红枣', '木材'],
  '贵金属': ['黄金', '白银'],
  '能源': ['动力煤', '天然气', '液化天然气'],
  '金融': ['沪深300', '中证500', '中证1000', '上证50', '国债', '10年期国债'],
}

export async function POST() {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: {
        source: { in: FUTURES_SOURCES },
        publishedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { publishedAt: 'desc' },
      take: 500,
    })

    console.log('[futures-analysis/refresh] found', articles.length, 'articles')

    const results: string[] = []

    for (const [sector, varieties] of Object.entries(SECTOR_VARIETIES)) {
      for (const variety of varieties) {
        const relevant = articles.filter(
          (a) => a.title.includes(variety) || a.content.includes(variety)
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
            sector,
            contradiction: analysis.contradiction,
            opportunity: analysis.opportunity,
            bullCase: analysis.bullCase,
            bearCase: analysis.bearCase,
            sentiment: analysis.sentiment,
          },
          update: {
            sector,
            contradiction: analysis.contradiction,
            opportunity: analysis.opportunity,
            bullCase: analysis.bullCase,
            bearCase: analysis.bearCase,
            sentiment: analysis.sentiment,
          },
        })

        results.push(variety)
      }
    }

    return NextResponse.json({ updated: results.length, varieties: results })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
