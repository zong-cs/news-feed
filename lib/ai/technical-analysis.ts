import { KBar } from '@/lib/market/ths'
import { generateStructuredResponse, getLLMErrorStatus } from './llm-client'

export interface TrendlineBreakout {
  timeframe: 'daily' | 'weekly'
  type: 'horizontal' | 'diagonal'
  direction: 'bullish' | 'bearish'
  description: string
  // 趋势线两个锚点，用于在图表上绘制
  line: {
    p1: { date: string; price: number }  // YYYYMMDD
    p2: { date: string; price: number }
  }
  breakoutDate: string   // YYYYMMDD，突破发生的日期
  breakoutPrice: number  // 突破时的收盘价
}

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
  // 趋势线突破（无突破则为 null）
  trendlineBreakout: TrendlineBreakout | null
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

const TRENDLINE_BREAKOUT_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    timeframe: { type: 'string', enum: ['daily', 'weekly'] },
    type: { type: 'string', enum: ['horizontal', 'diagonal'] },
    direction: { type: 'string', enum: ['bullish', 'bearish'] },
    description: { type: 'string' },
    line: {
      type: 'object',
      additionalProperties: false,
      properties: {
        p1: {
          type: 'object',
          additionalProperties: false,
          properties: { date: { type: 'string' }, price: { type: 'number' } },
          required: ['date', 'price'],
        },
        p2: {
          type: 'object',
          additionalProperties: false,
          properties: { date: { type: 'string' }, price: { type: 'number' } },
          required: ['date', 'price'],
        },
      },
      required: ['p1', 'p2'],
    },
    breakoutDate: { type: 'string' },
    breakoutPrice: { type: 'number' },
  },
  required: ['timeframe', 'type', 'direction', 'description', 'line', 'breakoutDate', 'breakoutPrice'],
}

const TECHNICAL_ANALYSIS_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    support1: { type: 'number' },
    support2: { type: 'number' },
    resistance1: { type: 'number' },
    resistance2: { type: 'number' },
    dailyTrend: { type: 'string', enum: ['up', 'down', 'sideways'] },
    weeklyTrend: { type: 'string', enum: ['up', 'down', 'sideways'] },
    cyclePosition: { type: 'string' },
    trendlineBreakout: { anyOf: [TRENDLINE_BREAKOUT_SCHEMA, { type: 'null' }] },
    entryPoint: { type: 'number' },
    entryLogic: { type: 'string' },
    stopLoss: { type: 'number' },
    target1: { type: 'number' },
    target2: { type: 'number' },
    riskRewardRatio: { type: 'string' },
    signal: { type: 'string', enum: ['strong_buy', 'buy', 'neutral', 'sell', 'strong_sell'] },
    summary: { type: 'string' },
  },
  required: [
    'support1', 'support2', 'resistance1', 'resistance2',
    'dailyTrend', 'weeklyTrend', 'cyclePosition', 'trendlineBreakout',
    'entryPoint', 'entryLogic', 'stopLoss', 'target1', 'target2',
    'riskRewardRatio', 'signal', 'summary',
  ],
}

const SYSTEM_PROMPT = `你是一位专业的期货技术分析师，擅长K线分析、趋势判断、支撑阻力位识别、趋势线突破识别。

根据提供的日线和周线K线数据，进行技术分析。

分析要求：
1. 支撑阻力位：基于近期高低点、整数关口、均线位置识别关键价位
2. 趋势判断：判断日线和周线各自的趋势方向
3. 周期位置：描述当前价格处于什么周期位置（如底部区域、顶部区域、中段整理等）
4. 趋势线突破：判断最近3根K线内是否发生了日线或周线趋势线突破
   - 水平趋势线：价格有效突破近期水平压力位或支撑位（需要成交量配合）
   - 斜趋势线：价格有效突破连接多个高点或低点形成的斜趋势线
   - 有效突破条件：收盘价站上/跌破趋势线，非假突破
   - 若无突破，trendlineBreakout 填 null
   - 若有突破，必须填写 line.p1、line.p2（趋势线两个锚点的日期和价格，从K线数据中取实际日期），breakoutDate（突破发生日期），breakoutPrice（突破收盘价），这些字段不能省略
5. 入场点：给出具体的建议入场价格（顺势方向）
6. 止损止盈：基于支撑阻力位给出止损和两个目标位
7. 盈亏比：计算入场点到止损和目标位1的盈亏比。
8. 所有价格必须参考输入K线的实际价格区间，日期必须来自输入数据。`

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
      return await generateStructuredResponse<TechnicalAnalysis>({
        schemaName: 'futures_technical_analysis',
        schema: TECHNICAL_ANALYSIS_SCHEMA,
        instructions: SYSTEM_PROMPT,
        input: prompt,
        maxOutputTokens: 4096,
      })
    } catch (err) {
      const status = getLLMErrorStatus(err)
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
