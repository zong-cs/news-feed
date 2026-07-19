'use client'

import { useState } from 'react'
import { BreakoutChartModal } from './BreakoutChartModal'

interface TrendlineBreakout {
  timeframe: 'daily' | 'weekly'
  type: 'horizontal' | 'diagonal'
  direction: 'bullish' | 'bearish'
  description: string
  line: {
    p1: { date: string; price: number }
    p2: { date: string; price: number }
  }
  breakoutDate: string
  breakoutPrice: number
}

interface TechnicalAnalysis {
  signal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell'
  symbol?: string
  entryPoint: number
  stopLoss: number
  target1: number
  riskRewardRatio: string
  entryLogic: string
  trendlineBreakout: TrendlineBreakout | null
}

interface Analysis {
  id: number
  variety: string
  sector: string | null
  sentiment: string
  technicalAnalysis?: string | null
}

interface BreakoutItem {
  variety: string
  sector: string
  symbol?: string
  breakout: TrendlineBreakout
  signal: TechnicalAnalysis['signal']
  entryPoint: number
  stopLoss: number
  target1: number
  riskRewardRatio: string
  entryLogic: string
}

function buildBreakouts(analyses: Analysis[]): BreakoutItem[] {
  const items: BreakoutItem[] = []
  for (const a of analyses) {
    if (!a.technicalAnalysis) continue
    let ta: TechnicalAnalysis
    try { ta = JSON.parse(a.technicalAnalysis) } catch { continue }
    if (!ta.trendlineBreakout || !ta.entryPoint) continue
    // Only show breakouts with coordinate data for the chart
    if (!ta.trendlineBreakout.line || !ta.trendlineBreakout.breakoutDate) continue
    items.push({
      variety: a.variety,
      sector: a.sector ?? '其他',
      symbol: ta.symbol,
      breakout: ta.trendlineBreakout,
      signal: ta.signal,
      entryPoint: ta.entryPoint,
      stopLoss: ta.stopLoss,
      target1: ta.target1,
      riskRewardRatio: ta.riskRewardRatio,
      entryLogic: ta.entryLogic,
    })
  }
  const order = (i: BreakoutItem) => (i.breakout.direction === 'bullish' ? 0 : 10) + (i.breakout.timeframe === 'weekly' ? 0 : 1)
  return items.sort((a, b) => order(a) - order(b))
}

const TIMEFRAME_LABEL = { daily: '日线', weekly: '周线' }
const TYPE_LABEL = { horizontal: '水平趋势线', diagonal: '斜趋势线' }

function BreakoutCard({ item, onClick }: { item: BreakoutItem; onClick: () => void }) {
  const isBullish = item.breakout.direction === 'bullish'
  const isWeekly = item.breakout.timeframe === 'weekly'
  const borderColor = isBullish ? 'border-emerald-700' : 'border-rose-700'
  const bgColor = isBullish ? 'bg-emerald-950/40' : 'bg-rose-950/40'
  const accentColor = isBullish ? 'text-emerald-400' : 'text-rose-400'
  const badgeBg = isBullish ? 'bg-emerald-900/70 text-emerald-300' : 'bg-rose-900/70 text-rose-300'
  const timeframeBg = isWeekly ? 'bg-amber-900/60 text-amber-300' : 'bg-slate-700/60 text-slate-300'

  return (
    <div
      className={`rounded-xl border ${borderColor} ${bgColor} p-4 cursor-pointer hover:brightness-110 transition-all`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-base font-bold ${accentColor}`}>{item.variety}</span>
          {item.symbol && <span className="text-xs font-mono text-slate-400">{item.symbol}</span>}
          <span className="text-xs text-slate-500">{item.sector}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${timeframeBg}`}>
            {TIMEFRAME_LABEL[item.breakout.timeframe]}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeBg}`}>
            {isBullish ? '向上突破' : '向下突破'}
          </span>
          <span className="text-[10px] text-slate-600 ml-1">查看图表 →</span>
        </div>
      </div>

      <p className="text-xs text-slate-300 mb-3 leading-relaxed">
        <span className="text-slate-500 mr-1">{TYPE_LABEL[item.breakout.type]}：</span>
        {item.breakout.description}
      </p>

      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="rounded-lg bg-slate-800/60 p-2">
          <p className="text-[10px] text-slate-500 mb-0.5">入场</p>
          <p className={`text-sm font-mono font-bold ${accentColor}`}>{item.entryPoint}</p>
        </div>
        <div className="rounded-lg bg-slate-800/60 p-2">
          <p className="text-[10px] text-slate-500 mb-0.5">止损</p>
          <p className="text-sm font-mono font-bold text-rose-400">{item.stopLoss}</p>
        </div>
        <div className="rounded-lg bg-slate-800/60 p-2">
          <p className="text-[10px] text-slate-500 mb-0.5">目标</p>
          <p className="text-sm font-mono font-bold text-emerald-400">{item.target1}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">盈亏比</span>
        <span className={`text-xs font-mono font-bold ${accentColor}`}>{item.riskRewardRatio}</span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.entryLogic}</p>
    </div>
  )
}

export function BreakoutSection({ analyses }: { analyses: Analysis[] }) {
  const items = buildBreakouts(analyses)
  const [selected, setSelected] = useState<BreakoutItem | null>(null)

  if (items.length === 0) return null

  const bullish = items.filter((i) => i.breakout.direction === 'bullish')
  const bearish = items.filter((i) => i.breakout.direction === 'bearish')

  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <span className="inline-block w-1.5 h-4 rounded-full bg-amber-500" />
        趋势线突破
        <span className="text-xs text-slate-500 font-normal">· 日线 / 周线有效突破</span>
        <span className="text-xs text-slate-600 font-normal ml-auto">{items.length} 个品种</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bullish.length > 0 && (
          <div>
            <p className="text-xs font-medium text-emerald-500 mb-3 flex items-center gap-1">
              <span>▲</span> 向上突破 ({bullish.length})
            </p>
            <div className="space-y-3">
              {bullish.map((item) => (
                <BreakoutCard key={item.variety} item={item} onClick={() => setSelected(item)} />
              ))}
            </div>
          </div>
        )}
        {bearish.length > 0 && (
          <div>
            <p className="text-xs font-medium text-rose-500 mb-3 flex items-center gap-1">
              <span>▼</span> 向下突破 ({bearish.length})
            </p>
            <div className="space-y-3">
              {bearish.map((item) => (
                <BreakoutCard key={item.variety} item={item} onClick={() => setSelected(item)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {selected && (
        <BreakoutChartModal
          variety={selected.variety}
          symbol={selected.symbol}
          breakout={selected.breakout}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  )
}
