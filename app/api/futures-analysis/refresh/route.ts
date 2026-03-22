import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { analyzeFuturesVariety } from '@/lib/ai/futures-analysis'
import { runScrapeJob } from '@/lib/news/scrape-job'

export const maxDuration = 300

const FUTURES_SOURCES = [
  'eafutures', 'ztqh', 'zlqh', 'thsfutures', 'emfutures', 'citicsf',
  'eastmoney', 'cls', 'sina', 'wallstreetcn', 'stcn', 'tonghuashun', 'xueqiu',
]

const SECTOR_VARIETIES: Record<string, string[]> = {
  '黑色金属': ['螺纹钢', '铁矿石', '焦炭', '焦煤', '硅铁', '锰硅'],
  '有色金属': ['铜', '铝', '锌', '铅', '镍', '锡', '氧化铝', '工业硅', '碳酸锂', '多晶硅'],
  '化工': ['原油', '燃料油', '沥青', '甲醇', '乙二醇', 'PTA', '对二甲苯', '苯乙烯', 'PVC', '橡胶', '20号胶', '丁二烯橡胶', '纯碱', '烧碱', '尿素', '纸浆', '玻璃'],
  '农产品': ['豆粕', '豆油', '大豆', '玉米', '棉花', '白糖', '棕榈油', '菜粕', '菜油', '花生', '鸡蛋', '生猪', '苹果', '红枣'],
  '贵金属': ['黄金', '白银', '铂', '钯'],
  '能源': ['天然气'],
  '金融': ['沪深300', '中证500', '中证1000', '上证50'],
}

export async function POST() {
  try {
    // Scrape all futures sources first
    await Promise.allSettled(FUTURES_SOURCES.map((s) => runScrapeJob(s)))

    const articles = await prisma.newsArticle.findMany({
      where: {
        source: { in: FUTURES_SOURCES },
        publishedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { publishedAt: 'desc' },
      take: 500,
    })

    console.log('[futures-analysis/refresh] found', articles.length, 'articles')

    const tasks: Array<{ sector: string; variety: string; relevant: typeof articles }> = []

    for (const [sector, varieties] of Object.entries(SECTOR_VARIETIES)) {
      for (const variety of varieties) {
        const relevant = articles.filter(
          (a) => a.title.includes(variety) || a.content.includes(variety)
        )
        if (relevant.length > 0) tasks.push({ sector, variety, relevant })
      }
    }

    console.log('[futures-analysis/refresh] total tasks:', tasks.length)

    const results: string[] = []

    // Process one at a time to avoid Kimi 429 overload
    for (const { sector, variety, relevant } of tasks) {
      console.log('[futures-analysis/refresh] analyzing', variety, 'with', relevant.length, 'articles')
      const analysis = await analyzeFuturesVariety(
        variety,
        relevant.map((a) => ({ title: a.title, content: a.content, source: a.source, url: a.url }))
      )
      if (!analysis) continue
      const sourcesJson = JSON.stringify(analysis.sources)
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
          sources: sourcesJson,
        },
        update: {
          sector,
          contradiction: analysis.contradiction,
          opportunity: analysis.opportunity,
          bullCase: analysis.bullCase,
          bearCase: analysis.bearCase,
          sentiment: analysis.sentiment,
          sources: sourcesJson,
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
