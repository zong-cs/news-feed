'use client'

import { useState } from 'react'

interface ArticleRef {
  title: string
  source: string
  url: string
}

interface Analysis {
  id: number
  variety: string
  contradiction: string
  opportunity: string
  bullCase: string
  bearCase: string
  sentiment: string
  sources: string
  updatedAt: string
}

export function VarietyAnalysisCard({ analysis }: { analysis: Analysis }) {
  const [showSources, setShowSources] = useState(false)

  const sentimentConfig = {
    bullish: { label: '看多', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    bearish: { label: '看空', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    neutral: { label: '中性', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
  }

  const cfg = sentimentConfig[analysis.sentiment as keyof typeof sentimentConfig] ?? sentimentConfig.neutral

  let sources: ArticleRef[] = []
  try {
    sources = JSON.parse(analysis.sources || '[]')
  } catch {
    sources = []
  }

  const SOURCE_LABELS: Record<string, string> = {
    eafutures: '东证期货', ztqh: '中泰期货', zlqh: '浙商期货', thsfutures: '同花顺期货',
    emfutures: '东方财富期货', citicsf: '中信期货', eastmoney: '东方财富', cls: '财联社',
    sina: '新浪财经', wallstreetcn: '华尔街见闻', stcn: '证券时报', tonghuashun: '同花顺',
    xueqiu: '雪球',
  }

  return (
    <div className={`rounded-xl border ${cfg.border} bg-white p-5 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{analysis.variety}</h3>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          {cfg.label}
        </span>
      </div>

      <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3">
        <p className="text-xs font-semibold text-red-600 mb-1">核心矛盾</p>
        <p className="text-sm text-red-800 leading-relaxed">{analysis.contradiction}</p>
      </div>

      <div className="mb-4 rounded-lg bg-blue-50 border border-blue-100 p-3">
        <p className="text-xs font-semibold text-blue-600 mb-1">交易机会</p>
        <p className="text-sm text-blue-800 leading-relaxed">{analysis.opportunity}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg bg-green-50 border border-green-100 p-3">
          <p className="text-xs font-semibold text-green-600 mb-1">做多依据</p>
          <p className="text-xs text-green-800 leading-relaxed">{analysis.bullCase}</p>
        </div>
        <div className="rounded-lg bg-red-50 border border-red-100 p-3">
          <p className="text-xs font-semibold text-red-600 mb-1">做空依据</p>
          <p className="text-xs text-red-800 leading-relaxed">{analysis.bearCase}</p>
        </div>
      </div>

      {sources.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowSources((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <span>参考来源 ({sources.length})</span>
            <span>{showSources ? '▲' : '▼'}</span>
          </button>
          {showSources && (
            <ul className="mt-2 space-y-1">
              {sources.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs">
                  <span className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px]">
                    {SOURCE_LABELS[s.source] ?? s.source}
                  </span>
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600 hover:underline leading-relaxed line-clamp-2"
                    >
                      {s.title}
                    </a>
                  ) : (
                    <span className="text-gray-600 leading-relaxed line-clamp-2">{s.title}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-400 text-right">
        更新于 {new Date(analysis.updatedAt).toLocaleString('zh-CN')}
      </p>
    </div>
  )
}
