'use client'

import { useState } from 'react'

interface ArticleRef {
  title: string
  source: string
  url: string
}

interface TechnicalAnalysis {
  support1: number
  support2: number
  resistance1: number
  resistance2: number
  dailyTrend: 'up' | 'down' | 'sideways'
  weeklyTrend: 'up' | 'down' | 'sideways'
  cyclePosition: string
  entryPoint: number
  entryLogic: string
  stopLoss: number
  target1: number
  target2: number
  riskRewardRatio: string
  signal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell'
  summary: string
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
  technicalAnalysis?: string | null
  technicalUpdatedAt?: string | null
}

const TREND_LABEL: Record<string, string> = {
  up: '↑ 上涨', down: '↓ 下跌', sideways: '→ 震荡',
}
const TREND_COLOR: Record<string, string> = {
  up: 'text-green-600', down: 'text-red-600', sideways: 'text-gray-500',
}
const SIGNAL_CONFIG: Record<string, { label: string; color: string }> = {
  strong_buy:  { label: '强烈做多', color: 'bg-green-600 text-white' },
  buy:         { label: '做多',     color: 'bg-green-100 text-green-700' },
  neutral:     { label: '观望',     color: 'bg-gray-100 text-gray-600' },
  sell:        { label: '做空',     color: 'bg-red-100 text-red-700' },
  strong_sell: { label: '强烈做空', color: 'bg-red-600 text-white' },
}

const SOURCE_LABELS: Record<string, string> = {
  eafutures: '东亚期货', ztqh: '中泰期货', zlqh: '中粮期货', thsfutures: '同花顺期货',
  emfutures: '东方财富期货', citicsf: '中信期货', eastmoney: '东方财富', cls: '财联社',
  sina: '新浪财经', wallstreetcn: '华尔街见闻', stcn: '证券时报', tonghuashun: '同花顺',
  xueqiu: '雪球', nanhua: '南华期货', gtjaqh: '国泰君安期货', htqh: '华泰期货',
}

export function VarietyAnalysisCard({ analysis }: { analysis: Analysis }) {
  const [showSources, setShowSources] = useState(false)
  const [tab, setTab] = useState<'fundamental' | 'technical'>('fundamental')

  const sentimentConfig = {
    bullish: { label: '看多', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    bearish: { label: '看空', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    neutral: { label: '中性', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
  }
  const cfg = sentimentConfig[analysis.sentiment as keyof typeof sentimentConfig] ?? sentimentConfig.neutral

  let sources: ArticleRef[] = []
  try { sources = JSON.parse(analysis.sources || '[]') } catch { sources = [] }

  const [collapsed, setCollapsed] = useState(sources.length === 0)

  let ta: TechnicalAnalysis | null = null
  try { ta = analysis.technicalAnalysis ? JSON.parse(analysis.technicalAnalysis) : null } catch { ta = null }

  const signalCfg = ta ? (SIGNAL_CONFIG[ta.signal] ?? SIGNAL_CONFIG.neutral) : null

  return (
    <div className={`rounded-xl border ${cfg.border} bg-white shadow-sm overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <h3 className="text-base font-bold text-gray-900">{analysis.variety}</h3>
        <div className="flex items-center gap-2">
          {sources.length === 0 && collapsed && (
            <span className="text-xs text-gray-400">暂无相关新闻</span>
          )}
          {signalCfg && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${signalCfg.color}`}>
              {signalCfg.label}
            </span>
          )}
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-gray-400 hover:text-gray-600 ml-1 text-xs"
          >
            {collapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {!collapsed && (<>
      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-5">
        <button
          onClick={() => setTab('fundamental')}
          className={`text-xs font-medium py-2 mr-4 border-b-2 transition-colors ${
            tab === 'fundamental' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          基本面
        </button>
        <button
          onClick={() => setTab('technical')}
          className={`text-xs font-medium py-2 border-b-2 transition-colors ${
            tab === 'technical' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          技术面 {!ta && <span className="text-gray-300">（暂无）</span>}
        </button>
      </div>

      <div className="p-5">
        {/* Fundamental tab */}
        {tab === 'fundamental' && (
          <>
            <div className="mb-3 rounded-lg bg-red-50 border border-red-100 p-3">
              <p className="text-xs font-semibold text-red-600 mb-1">核心矛盾</p>
              <p className="text-sm text-red-800 leading-relaxed">{analysis.contradiction}</p>
            </div>
            <div className="mb-3 rounded-lg bg-blue-50 border border-blue-100 p-3">
              <p className="text-xs font-semibold text-blue-600 mb-1">交易机会</p>
              <p className="text-sm text-blue-800 leading-relaxed">{analysis.opportunity}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
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
                          <a href={s.url} target="_blank" rel="noopener noreferrer"
                            className="text-gray-600 hover:text-blue-600 hover:underline leading-relaxed line-clamp-2">
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
          </>
        )}

        {/* Technical tab */}
        {tab === 'technical' && !ta && (
          <div className="text-center py-8 text-gray-400 text-sm">
            技术分析暂未生成，请在 Admin 页面点击「刷新技术分析」
          </div>
        )}
        {tab === 'technical' && ta && (
          <>
            {/* Trend */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">日线趋势</p>
                <p className={`text-sm font-bold ${TREND_COLOR[ta.dailyTrend]}`}>{TREND_LABEL[ta.dailyTrend]}</p>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">周线趋势</p>
                <p className={`text-sm font-bold ${TREND_COLOR[ta.weeklyTrend]}`}>{TREND_LABEL[ta.weeklyTrend]}</p>
              </div>
            </div>

            {/* Cycle position */}
            <div className="mb-3 rounded-lg bg-purple-50 border border-purple-100 p-3">
              <p className="text-xs font-semibold text-purple-600 mb-1">周期位置</p>
              <p className="text-sm text-purple-800 leading-relaxed">{ta.cyclePosition}</p>
            </div>

            {/* Support / Resistance */}
            <div className="mb-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-green-50 border border-green-100 p-3">
                <p className="text-xs font-semibold text-green-600 mb-2">支撑位</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">S1</span>
                    <span className="font-mono font-semibold text-green-700">{ta.support1}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">S2</span>
                    <span className="font-mono font-semibold text-green-700">{ta.support2}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                <p className="text-xs font-semibold text-red-600 mb-2">压力位</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">R1</span>
                    <span className="font-mono font-semibold text-red-700">{ta.resistance1}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">R2</span>
                    <span className="font-mono font-semibold text-red-700">{ta.resistance2}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Entry */}
            <div className="mb-3 rounded-lg bg-blue-50 border border-blue-100 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-blue-600">入场建议</p>
                <span className="text-xs font-mono font-bold text-blue-700">盈亏比 {ta.riskRewardRatio}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">入场</p>
                  <p className="text-xs font-mono font-bold text-blue-700">{ta.entryPoint}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">止损</p>
                  <p className="text-xs font-mono font-bold text-red-600">{ta.stopLoss}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 mb-0.5">目标</p>
                  <p className="text-xs font-mono font-bold text-green-600">{ta.target1}</p>
                </div>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed">{ta.entryLogic}</p>
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">技术综述</p>
              <p className="text-xs text-gray-700 leading-relaxed">{ta.summary}</p>
            </div>

            {analysis.technicalUpdatedAt && (
              <p className="mt-3 text-xs text-gray-400 text-right">
                技术分析更新于 {new Date(analysis.technicalUpdatedAt).toLocaleString('zh-CN')}
              </p>
            )}
          </>
        )}

        {tab === 'fundamental' && (
          <p className="mt-3 text-xs text-gray-400 text-right">
            基本面更新于 {new Date(analysis.updatedAt).toLocaleString('zh-CN')}
          </p>
        )}
      </div>
      </>)}
    </div>
  )
}
