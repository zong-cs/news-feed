import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL,
})

export interface ArticleRef {
  title: string
  source: string
  url: string
}

export interface FuturesAnalysis {
  variety: string
  contradiction: string
  opportunity: string
  bullCase: string
  bearCase: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  sources: ArticleRef[]
  updatedAt: Date
}

const SYSTEM_PROMPT = `你是一位专业的期货市场分析师。根据提供的多篇期货相关文章，对指定品种进行基本面分析。

请输出以下 JSON 格式（不要包含 markdown 代码块）：
{
  "contradiction": "当前最核心的基本面矛盾（供需矛盾、政策矛盾等，2-3句话）",
  "opportunity": "潜在交易机会描述（基于矛盾的交易逻辑，2-3句话）",
  "bullCase": "做多依据（支撑价格上涨的核心逻辑，2-3句话）",
  "bearCase": "做空依据（压制价格的核心逻辑，2-3句话）",
  "sentiment": "bullish|bearish|neutral"
}`

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function analyzeFuturesVariety(
  variety: string,
  articles: Array<{ title: string; content: string; source: string; url: string }>
): Promise<FuturesAnalysis | null> {
  if (articles.length === 0) return null

  const combined = articles
    .slice(0, 10)
    .map((a, i) => `[${i + 1}] 来源:${a.source}\n标题:${a.title}\n内容:${a.content}`)
    .join('\n\n---\n\n')
    .slice(0, 8000)

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `品种：${variety}\n\n相关文章：\n${combined}`,
          },
        ],
      })

      const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''
      const match = raw.match(/\{[\s\S]*\}/)
      const text = match ? match[0] : raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
      console.log('[futures-analysis] raw response for', variety, ':', text.slice(0, 200))

      const parsed = JSON.parse(text)
      const usedArticles = articles.slice(0, 10)
      return {
        variety,
        contradiction: parsed.contradiction ?? '',
        opportunity: parsed.opportunity ?? '',
        bullCase: parsed.bullCase ?? '',
        bearCase: parsed.bearCase ?? '',
        sentiment: parsed.sentiment ?? 'neutral',
        sources: usedArticles.map((a) => ({ title: a.title, source: a.source, url: a.url })),
        updatedAt: new Date(),
      }
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status
      if (status === 429 && attempt < 2) {
        const wait = (attempt + 1) * 10000
        console.warn(`[futures-analysis] 429 for ${variety}, retrying in ${wait}ms (attempt ${attempt + 1})`)
        await sleep(wait)
        continue
      }
      console.error('[futures-analysis] error for', variety, ':', err)
      return null
    }
  }

  return null
}
