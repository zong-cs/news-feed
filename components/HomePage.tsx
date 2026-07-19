'use client'

import { FuturesAnalysis } from '@/components/futures/FuturesAnalysis'
import { RecommendationSection } from '@/components/futures/RecommendationSection'
import { BreakoutSection } from '@/components/futures/BreakoutSection'

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

export function HomePage({ initialAnalyses }: { initialAnalyses: Analysis[] }) {
  return (
    <main className="min-h-screen bg-[#0f1117]">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Trading Desk</h1>
          <p className="text-sm text-slate-400 mt-1">实时市场资讯 · 期货 AI 分析</p>
        </div>

        {/* Trendline breakouts */}
        <BreakoutSection analyses={initialAnalyses} />

        {/* Futures analysis */}
        <FuturesAnalysis analyses={initialAnalyses} />

      </div>
    </main>
  )
}
