'use client'

import { useEffect, useState } from 'react'
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
}

const SECTOR_ORDER = ['黑色金属', '有色金属', '化工', '农产品', '贵金属', '能源', '金融', '其他']

export function FuturesAnalysis() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/futures-analysis')
      .then((r) => r.json())
      .then((data) => setAnalyses(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-3 mt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm mt-6">
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
        <h2 className="text-base font-semibold text-gray-700">期货品种 AI 分析</h2>
        <span className="text-xs text-gray-400">· 矛盾 · 机会 · 多空依据</span>
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
