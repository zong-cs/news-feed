'use client'

import { SectorSection } from '@/components/futures/SectorSection'

interface Analysis {
  id: number
  variety: string
  sector: string | null
  contradiction: string
  opportunity: string
  bullCase: string
  bearCase: string
  sentiment: string
  sources: string
  updatedAt: string
  technicalAnalysis?: string | null
  technicalUpdatedAt?: string | null
}

const SECTOR_ORDER = ['黑色金属', '有色金属', '化工', '农产品', '贵金属', '能源', '金融', '其他']

export function FuturesAnalysis({ analyses }: { analyses: Analysis[] }) {
  if (analyses.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm mt-6">
        暂无期货分析数据，请在 <a href="/admin" className="text-blue-500 underline">Admin</a> 页面刷新期货分析
      </div>
    )
  }

  const bySector: Record<string, Analysis[]> = {}
  for (const a of analyses) {
    const sector = a.sector || '其他'
    if (!bySector[sector]) bySector[sector] = []
    bySector[sector].push(a)
  }
  const sectors = SECTOR_ORDER.filter((s) => bySector[s]?.length > 0)

  return (
    <div className="mt-8 space-y-8">
      <div className="flex items-center gap-2">
        <span className="inline-block w-1.5 h-4 rounded-full bg-yellow-500" />
        <h2 className="text-base font-semibold text-slate-300">期货品种 AI 分析</h2>
        <span className="text-xs text-slate-500">· 矛盾 · 机会 · 多空依据</span>
      </div>
      <div className="space-y-8">
        {sectors.map((sector) => (
          <SectorSection
            key={sector}
            sector={sector}
            analyses={bySector[sector]}
          />
        ))}
      </div>
    </div>
  )
}
