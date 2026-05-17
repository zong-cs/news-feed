'use client'

import { useState } from 'react'
import { HotNews } from '@/components/news/HotNews'
import { InstrumentGrid } from '@/components/instruments/InstrumentGrid'
import { FuturesAnalysis } from '@/components/futures/FuturesAnalysis'

const TABS = [
  // { key: 'commodity', label: '大宗商品' },
  { key: 'crypto', label: '加密货币' },
  { key: 'stock', label: '股市' },
] as const

type TabKey = (typeof TABS)[number]['key']

export function HomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('crypto')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">财经新闻聚合</h1>
            <p className="text-sm text-gray-500 mt-1">实时市场资讯 · 每60秒自动刷新</p>
          </div>
          <a
            href="/admin"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Admin
          </a>
        </div>

        {/* Hot macro news */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="inline-block w-1.5 h-4 rounded-full bg-red-500" />
            宏观热点
          </h2>
          <HotNews />
        </section>

        {/* Tabs */}
        <section>
          <div className="flex gap-1 border-b border-gray-200 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab !== 'commodity' && <InstrumentGrid type={activeTab} />}

          {activeTab === 'commodity' && <FuturesAnalysis />}
        </section>

      </div>
    </main>
  )
}
