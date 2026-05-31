'use client'

import { useState } from 'react'
import { VarietyAnalysisCard } from './VarietyAnalysisCard'

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
  const bySector: Record<string, Analysis[]> = {}
  for (const a of analyses) {
    const sector = a.sector || '其他'
    if (!bySector[sector]) bySector[sector] = []
    bySector[sector].push(a)
  }
  const sectors = SECTOR_ORDER.filter((s) => bySector[s]?.length > 0)

  const [activeSector, setActiveSector] = useState(sectors[0] ?? '')

  if (analyses.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        暂无期货分析数据，请在 <a href="/admin" className="text-blue-500 underline">Admin</a> 页面刷新期货分析
      </div>
    )
  }

  return (
    <div>
      {/* Sector tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-700 mb-6">
        {sectors.map((sector) => (
          <button
            key={sector}
            onClick={() => setActiveSector(sector)}
            className={`shrink-0 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeSector === sector
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {sector}
            <span className="ml-1.5 text-xs opacity-60">{bySector[sector].length}</span>
          </button>
        ))}
      </div>

      {/* Active sector cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(bySector[activeSector] ?? []).map((a) => (
          <VarietyAnalysisCard key={a.id} analysis={a} />
        ))}
      </div>
    </div>
  )
}
