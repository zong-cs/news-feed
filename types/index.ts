export type InstrumentType = 'stock' | 'crypto' | 'commodity' | 'forex'
export type Sentiment = 'bullish' | 'bearish' | 'neutral'

export interface Instrument {
  id: number
  symbol: string
  name: string
  type: InstrumentType
  exchange: string | null
  _count?: { articles: number }
}

export interface Article {
  id: number
  url: string
  title: string
  content: string
  source: string
  publishedAt: string
  summary: string | null
  sentiment: string | null
  keyDataPoints: string | null
  aiProcessed: boolean
}

export interface ArticleWithInstruments extends Article {
  instruments: Array<{
    relevance: number
    instrument: Instrument
  }>
}

export interface InstrumentWithArticles extends Instrument {
  articles: Array<{
    relevance: number
    article: Article
  }>
}

export interface ScrapeJobStatus {
  id: number
  source: string
  status: string
  lastRun: string | null
  count: number
  error: string | null
}
