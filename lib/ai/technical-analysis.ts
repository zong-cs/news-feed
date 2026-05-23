import Anthropic from '@anthropic-ai/sdk'
import { KBar } from '@/lib/market/ths'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL,
})

export interface TechnicalAnalysis {
  // 关键价位
  support1: number
  support2: number
  resistance1: number
  resistance2: number
  // 周期判断
  dailyTrend: 'up' | 'down' | 'sideways'
  weeklyTrend: 'up' | 'down' | 'sideways'
  cyclePosition: string
  // 入场建议
  entryPoint: number
  entryLogic: string
  stopLoss: number
  target1: number
  target2: number
  // 盈亏比
  riskRewardRatio: string
  // 综合评级
  signal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell'
  summary: string
}

const SYSTEM_PROMPT = `你是一位专业的期货技术分析师，擅长K线分析、趋势判断、支撑阻力位识别。

根据提供的日线和周线K线数据，进行技术分析。

分析要求：
1. 支撑阻力位：基于近期高低点、整数关口、均线位置识别关键价位
2. 趋势判断：判断日线和周线各自的趋势方向
3. 周期位置：描述当前价格处于什么周期位置（如底部区域、顶部区域、中段整理等）
4. 入场点：给出具体的建议入场价格（顺势方向）
5. 止损止盈：基于支撑阻力位给出止损和两个目标位
6. 盈亏比：计算入场点到止损和目标位1的盈亏比

输出严格按以下JSON格式（数字类型不要加引号）：
{
  "support1": 数字,
  "support2": 数字,
  "resistance1": 数字,
  "resistance2": 数字,
  "dailyTrend": "up|down|sideways",
  "weeklyTrend": "up|down|sideways",
  "cyclePosition": "字符串",
  "entryPoint": 数字,
  "entryLogic": "字符串",
  "stopLoss": 数字,
  "target1": 数字,
  "target2": 数字,
  "riskRewardRatio": "1:X.X",
  "signal": "strong_buy|buy|neutral|sell|strong_sell",
  "summary": "字符串"
}`

function formatBars(bars: KBar[], label: string): string {
  const recent = bars.slice(-60)
  const rows = recent.map(
    (b) => `${b.date} O:${b.open} H:${b.high} L:${b.low} C:${b.close} V:${b.volume}`
  ).join('\n')
  return `【${label}】最近${recent.length}根K线（从旧到新）：\n${rows}`
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function analyzeTechnical(
  variety: string,
  daily: KBar[],
  weekly: KBar[]
): Promise<TechnicalAnalysis | null> {
  if (daily.length < 20 || weekly.length < 10) return null

  const currentPrice = daily[daily.length - 1].close
  const prompt = `品种：${variety}\n当前价格：${currentPrice}\n\n${formatBars(daily, '日线')}\n\n${formatBars(weekly, '周线')}`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: prompt },
        ],
      })

      const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''
      const match = raw.match(/\{[\s\S]*\}/)
      const text = match ? match[0] : raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
      const parsed = JSON.parse(text) as TechnicalAnalysis
      return parsed
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status
      if (status === 429 && attempt < 2) {
        const wait = (attempt + 1) * 10000
        console.warn(`[technical] 429 for ${variety}, retrying in ${wait}ms`)
        await sleep(wait)
        continue
      }
      console.error(`[technical] error for ${variety}:`, err)
      return null
    }
  }
  return null
}
