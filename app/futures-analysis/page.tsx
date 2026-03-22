import { prisma } from '@/lib/db'
import { SectorSection } from '@/components/futures/SectorSection'

export const dynamic = 'force-dynamic'

const SECTOR_ORDER = ['黑色金属', '有色金属', '化工', '农产品', '贵金属', '能源', '金融', '其他']

export default async function FuturesAnalysisPage() {
  const analyses = await prisma.futuresVarietyAnalysis.findMany({
    orderBy: { updatedAt: 'desc' },
  })

  const bySector: Record<string, typeof analyses> = {}
  for (const a of analyses) {
    const sector = a.sector || '其他'
    if (!bySector[sector]) bySector[sector] = []
    bySector[sector].push(a)
  }

  const sectors = SECTOR_ORDER.filter((s) => bySector[s]?.length > 0)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">期货品种分析</h1>
            <p className="text-sm text-gray-500 mt-1">AI 基本面分析 · 矛盾 · 交易机会 · 多空依据</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Admin
            </a>
            <a
              href="/"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              ← 首页
            </a>
          </div>
        </div>

        {analyses.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">暂无分析数据</p>
            <p className="text-sm">请先在 Admin 页面抓取期货新闻，然后点击「刷新期货分析」</p>
          </div>
        ) : (
          <div className="space-y-10">
            {sectors.map((sector) => (
              <SectorSection
                key={sector}
                sector={sector}
                analyses={bySector[sector].map((a) => ({ ...a, updatedAt: a.updatedAt.toISOString(), sources: a.sources ?? '[]' }))}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
