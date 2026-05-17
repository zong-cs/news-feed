import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL,
})

export interface AnalysisResult {
  summary: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  instruments: Array<{
    symbol: string
    name: string
    type: 'stock' | 'crypto' | 'commodity' | 'forex'
    exchange?: string
    relevance: number
  }>
  keyDataPoints: string[]
}

const SYSTEM_PROMPT = `You are a financial news analyst. Analyze the given article and extract:
1. A concise summary (2-3 sentences)
2. Overall market sentiment: bullish, bearish, or neutral
3. Trading instruments mentioned (stocks, crypto, commodities, forex)
4. Key data points (prices, percentages, figures)

Respond ONLY with valid JSON matching this schema:
{
  "summary": "string",
  "sentiment": "bullish|bearish|neutral",
  "instruments": [
    {
      "symbol": "string (e.g. AAPL, BTC, GOLD, EUR/USD)",
      "name": "string",
      "type": "stock|crypto|commodity|forex",
      "exchange": "string or null",
      "relevance": 0.0-1.0
    }
  ],
  "keyDataPoints": ["string"]
}`

export async function analyzeArticle(
  title: string,
  content: string
): Promise<AnalysisResult | null> {
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Title: ${title}\n\nContent: ${content.slice(0, 4000)}`,
        },
      ],
    })

    const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''
    const match = raw.match(/\{[\s\S]*\}/)
    const text = match ? match[0] : raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    console.log('[claude] raw response:', raw.slice(0, 200))
    const result = JSON.parse(text) as AnalysisResult
    return result
  } catch (err) {
    console.error('[claude] analyzeArticle error:', err)
    return null
  }
}
