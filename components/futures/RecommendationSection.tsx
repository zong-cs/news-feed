'use client'

interface TechnicalAnalysis {
  signal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell'
  entryPoint: number
  stopLoss: number
  target1: number
  riskRewardRatio: string
  entryLogic: string
}

interface Analysis {
  id: number
  variety: string
  sector: string | null
  sentiment: string
  technicalAnalysis?: string | null
}

interface Rec {
  variety: string
  sector: string
  signal: TechnicalAnalysis['signal']
  sentiment: string
  entryPoint: number
  stopLoss: number
  target1: number
  riskRewardRatio: string
  entryLogic: string
  score: number
}

const SIGNAL_SCORE: Record<string, number> = {
  strong_buy: 5, buy: 3, neutral: 0, sell: -3, strong_sell: -5,
}
const SENTIMENT_SCORE: Record<string, number> = {
  bullish: 1, bearish: -1, neutral: 0,
}

function buildRecs(analyses: Analysis[]): { longs: Rec[]; shorts: Rec[] } {
  const recs: Rec[] = []

  for (const a of analyses) {
    if (!a.technicalAnalysis) continue
    let ta: TechnicalAnalysis
    try { ta = JSON.parse(a.technicalAnalysis) } catch { continue }
    if (!ta.signal || !ta.entryPoint) continue

    const score = (SIGNAL_SCORE[ta.signal] ?? 0) + (SENTIMENT_SCORE[a.sentiment] ?? 0)
    recs.push({
      variety: a.variety,
      sector: a.sector ?? '其他',
      signal: ta.signal,
      sentiment: a.sentiment,
      entryPoint: ta.entryPoint,
      stopLoss: ta.stopLoss,
      target1: ta.target1,
      riskRewardRatio: ta.riskRewardRatio,
      entryLogic: ta.entryLogic,
      score,
    })
  }

  const longs = recs.filter((r) => r.score >= 3).sort((a, b) => b.score - a.score).slice(0, 4)
  const shorts = recs.filter((r) => r.score <= -3).sort((a, b) => a.score - b.score).slice(0, 4)
  return { longs, shorts }
}

const SIGNAL_LABEL: Record<string, string> = {
  strong_buy: '强烈做多', buy: '做多', sell: '做空', strong_sell: '强烈做空',
}

function RecCard({ rec, direction }: { rec: Rec; direction: 'long' | 'short' }) {
  const isLong = direction === 'long'
  const borderColor = isLong ? 'border-green-800' : 'border-red-800'
  const accentColor = isLong ? 'text-green-400' : 'text-red-400'
  const bgColor = isLong ? 'bg-green-950/30' : 'bg-red-950/30'
  const badgeColor = isLong ? 'bg-green-900/60 text-green-300' : 'bg-red-900/60 text-red-300'

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className={`text-base font-bold ${accentColor}`}>{rec.variety}</span>
          <span className="ml-2 text-xs text-slate-500">{rec.sector}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
          {SIGNAL_LABEL[rec.signal]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="rounded-lg bg-slate-800/60 p-2">
          <p className="text-[10px] text-slate-500 mb-0.5">入场</p>
          <p className={`text-sm font-mono font-bold ${accentColor}`}>{rec.entryPoint}</p>
        </div>
        <div className="rounded-lg bg-slate-800/60 p-2">
          <p className="text-[10px] text-slate-500 mb-0.5">止损</p>
          <p className="text-sm font-mono font-bold text-red-400">{rec.stopLoss}</p>
        </div>
        <div className="rounded-lg bg-slate-800/60 p-2">
          <p className="text-[10px] text-slate-500 mb-0.5">目标</p>
          <p className="text-sm font-mono font-bold text-green-400">{rec.target1}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">盈亏比</span>
        <span className={`text-xs font-mono font-bold ${accentColor}`}>{rec.riskRewardRatio}</span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{rec.entryLogic}</p>
    </div>
  )
}

export function RecommendationSection({ analyses }: { analyses: Analysis[] }) {
  const { longs, shorts } = buildRecs(analyses)

  if (longs.length === 0 && shorts.length === 0) return null

  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <span className="inline-block w-1.5 h-4 rounded-full bg-blue-500" />
        今日推荐
        <span className="text-xs text-slate-500 font-normal">· 技术 + 基本面双向验证</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {longs.length > 0 && (
          <div>
            <p className="text-xs font-medium text-green-500 mb-3 flex items-center gap-1">
              <span>▲</span> 做多机会 ({longs.length})
            </p>
            <div className="space-y-3">
              {longs.map((rec) => (
                <RecCard key={rec.variety} rec={rec} direction="long" />
              ))}
            </div>
          </div>
        )}

        {shorts.length > 0 && (
          <div>
            <p className="text-xs font-medium text-red-500 mb-3 flex items-center gap-1">
              <span>▼</span> 做空机会 ({shorts.length})
            </p>
            <div className="space-y-3">
              {shorts.map((rec) => (
                <RecCard key={rec.variety} rec={rec} direction="short" />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
