import { prisma } from '@/lib/db'
import { VarietyAnalysisCard } from '@/components/futures/VarietyAnalysisCard'

export const dynamic = 'force-dynamic'

export default async function FuturesAnalysisPage() {
  const analyses = await prisma.futuresVarietyAnalysis.findMany({
    orderBy: { updatedAt: 'desc' },
  })

  const bullish = analyses.filter((a) => a.sentiment === 'bullish')
  const bearish = analyses.filter((a) => a.sentiment === 'bearish')
  const neutral = analyses.filter((a) => a.sentiment === 'neutral')

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
          <div className="space-y-8">
            {bullish.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-green-700 mb-4 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  看多品种 ({bullish.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {bullish.map((a) => (
                    <VarietyAnalysisCard key={a.id} analysis={{ ...a, updatedAt: a.updatedAt.toISOString() }} />
                  ))}
                </div>
              </section>
            )}

            {bearish.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-red-700 mb-4 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                  看空品种 ({bearish.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {bearish.map((a) => (
                    <VarietyAnalysisCard key={a.id} analysis={{ ...a, updatedAt: a.updatedAt.toISOString() }} />
                  ))}
                </div>
              </section>
            )}

            {neutral.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-gray-600 mb-4 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
                  中性品种 ({neutral.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {neutral.map((a) => (
                    <VarietyAnalysisCard key={a.id} analysis={{ ...a, updatedAt: a.updatedAt.toISOString() }} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
