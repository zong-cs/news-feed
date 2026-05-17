import OpenAI from 'openai'
import { KBar } from '@/lib/market/ths'

const client = new OpenAI({
  apiKey: process.env.MOONSHOT_API_KEY,
  baseURL: 'https://api.moonshot.cn/v1',
})

export interface TechnicalAnalysis {
  // 关键价位
  support1: number       // 第一支撑位
  support2: number       // 第二支撑位
  resistance1: number    // 第一压力位
  resistance2: number    // 第二压力位
  // 周期判断
  dailyTrend: 'up' | 'down' | 'sideways'   // 日线趋势
  weeklyTrend: 'up' | 'down' | 'sideways'  // 周线趋势
  cyclePosition: string  // 周期位置描述，如"日线超跌反弹区，周线下降趋势中"
  // 入场建议
  entryPoint: number     // 建议入场价
  entryLogic: string     // 入场逻辑
  stopLoss: number       // 止损位
  target1: number        // 目标位1
  target2: number        // 目标位2
  // 盈亏比
  riskRewardRatio: string // 如 "1:2.5"
  // 综合评级
  signal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell'
  summary: string        // 技术面综合描述（2-3句）
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
  // Send last 60 bars to stay within token limits
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
      const response = await client.chat.completions.create({
        model: 'moonshot-v1-8k',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      })

      const raw = response.choices[0]?.message?.content ?? ''
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
