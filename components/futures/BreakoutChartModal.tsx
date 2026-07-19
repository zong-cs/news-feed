'use client'

import { useEffect, useRef, useState } from 'react'
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  ColorType,
  LineStyle,
  IChartApi,
  Time,
  createSeriesMarkers,
} from 'lightweight-charts'

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

interface KBar {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface Props {
  variety: string
  symbol?: string
  breakout: TrendlineBreakout
  onClose: () => void
}

function toTime(date: string): Time {
  // YYYYMMDD → YYYY-MM-DD
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}` as Time
}

// Build trendline: only p1 → p2, no extrapolation
function buildTrendlineSeries(p1: { date: string; price: number }, p2: { date: string; price: number }) {
  return [
    { time: toTime(p1.date), value: p1.price },
    { time: toTime(p2.date), value: p2.price },
  ]
}

export function BreakoutChartModal({ variety, symbol, breakout, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly'>(breakout.timeframe)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const url = symbol
          ? `/api/kline?variety=${encodeURIComponent(variety)}&symbol=${encodeURIComponent(symbol)}`
          : `/api/kline?variety=${encodeURIComponent(variety)}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('获取K线数据失败')
        const data = await res.json()
        if (cancelled) return

        const bars: KBar[] = timeframe === 'daily' ? data.daily : data.weekly
        if (!bars || bars.length === 0) throw new Error('暂无K线数据')

        if (!containerRef.current) return

        // Destroy previous chart
        if (chartRef.current) {
          chartRef.current.remove()
          chartRef.current = null
        }

        const chart = createChart(containerRef.current, {
          layout: {
            background: { type: ColorType.Solid, color: '#0f1117' },
            textColor: '#94a3b8',
          },
          grid: {
            vertLines: { color: '#1e293b' },
            horzLines: { color: '#1e293b' },
          },
          crosshair: { mode: 1 },
          rightPriceScale: { borderColor: '#334155' },
          timeScale: { borderColor: '#334155', timeVisible: false },
          autoSize: true,
          height: 420,
        })
        chartRef.current = chart

        // Candlestick series
        const candleSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderUpColor: '#22c55e',
          borderDownColor: '#ef4444',
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
        })

        const candleData = bars.map((b) => ({
          time: toTime(b.date),
          open: b.open,
          high: b.high,
          low: b.low,
          close: b.close,
        }))
        candleSeries.setData(candleData)

        // Trendline series — only p1 to p2
        const trendlinePoints = buildTrendlineSeries(breakout.line.p1, breakout.line.p2)
        if (trendlinePoints.length > 0) {
          const lineSeries = chart.addSeries(LineSeries, {
            color: '#f59e0b',
            lineWidth: 2,
            lineStyle: LineStyle.Dashed,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          })
          lineSeries.setData(trendlinePoints)
        }

        // Breakout marker
        createSeriesMarkers(candleSeries, [{
          time: toTime(breakout.breakoutDate),
          position: breakout.direction === 'bullish' ? 'belowBar' : 'aboveBar',
          color: breakout.direction === 'bullish' ? '#22c55e' : '#ef4444',
          shape: breakout.direction === 'bullish' ? 'arrowUp' : 'arrowDown',
          text: '突破',
        }])

        // Focus view: 60 bars before p1, 10 bars after breakout
        const p1Idx = bars.findIndex((b) => b.date >= breakout.line.p1.date)
        const breakoutIdx = bars.findIndex((b) => b.date >= breakout.breakoutDate)
        const from = Math.max(0, (p1Idx >= 0 ? p1Idx : 0) - 5)
        const to = Math.min(bars.length - 1, (breakoutIdx >= 0 ? breakoutIdx : bars.length - 1) + 10)
        chart.timeScale().setVisibleRange({
          from: toTime(bars[from].date),
          to: toTime(bars[to].date),
        })
        setLoading(false)
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message ?? '加载失败')
          setLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [variety, breakout, timeframe])

  // Cleanup chart on unmount
  useEffect(() => {
    return () => { chartRef.current?.remove() }
  }, [])

  const isBullish = breakout.direction === 'bullish'
  const accentColor = isBullish ? 'text-emerald-400' : 'text-rose-400'
  const badgeBg = isBullish ? 'bg-emerald-900/70 text-emerald-300' : 'bg-rose-900/70 text-rose-300'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-3xl bg-[#0f1117] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className={`text-lg font-bold ${accentColor}`}>{variety}</span>
            {symbol && <span className="text-sm font-mono text-slate-400">{symbol}</span>}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeBg}`}>
              {isBullish ? '向上突破' : '向下突破'}
            </span>
            <span className="text-xs text-slate-500">
              {breakout.type === 'horizontal' ? '水平趋势线' : '斜趋势线'} · {breakout.timeframe === 'weekly' ? '周线' : '日线'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Timeframe toggle */}
            <div className="flex rounded-lg overflow-hidden border border-slate-700 text-xs">
              {(['daily', 'weekly'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 transition-colors ${timeframe === tf ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tf === 'daily' ? '日线' : '周线'}
                </button>
              ))}
            </div>
            <button
              onMouseDown={(e) => { e.stopPropagation(); onClose() }}
              className="text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Chart area */}
        <div className="px-5 pt-4">
          <div className="relative">
            <div ref={containerRef} style={{ height: 420 }} />
            {(loading || error) && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm bg-[#0f1117]">
                {loading ? '加载K线数据中…' : error}
              </div>
            )}
          </div>
        </div>

        {/* Breakout description */}
        <div className="px-5 py-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="text-slate-500 mr-1">突破详情：</span>
            {breakout.description}
          </p>
        </div>
      </div>
    </div>
  )
}
