'use client'

import { useState } from 'react'
import { HotNews } from '@/components/news/HotNews'
import { InstrumentGrid } from '@/components/instruments/InstrumentGrid'
import { FuturesAnalysis } from '@/components/futures/FuturesAnalysis'

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

const TABS = [
  { key: 'commodity', label: '大宗商品' },
  { key: 'crypto', label: '加密货币' },
  { key: 'stock', label: '股市' },
] as const

type TabKey = (typeof TABS)[number]['key']

export function HomePage({ initialAnalyses }: { initialAnalyses: Analysis[] }) {
  const [activeTab, setActiveTab] = useState<TabKey>('commodity')

  return (
    <main className="min-h-screen bg-[#0f1117]">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Trading Desk</h1>
            <p className="text-sm text-slate-400 mt-1">实时市场资讯 · 期货 AI 分析</p>
          </div>
          <a
            href="/admin"
            className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            Admin
          </a>
        </div>

        {/* Hot macro news */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <span className="inline-block w-1.5 h-4 rounded-full bg-red-500" />
            宏观热点
          </h2>
          <HotNews />
        </section>

        {/* Tabs */}
        <section>
          <div className="flex gap-1 border-b border-slate-700 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* InstrumentGrid hidden for commodity (data not useful), shown for crypto/stock */}
          {activeTab !== 'commodity' && <InstrumentGrid type={activeTab} />}

          {activeTab === 'commodity' && <FuturesAnalysis analyses={initialAnalyses} />}
        </section>

      </div>
    </main>
  )
}
