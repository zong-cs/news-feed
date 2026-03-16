import { notFound } from 'next/navigation'
import Link from 'next/link'
import { NewsList } from '@/components/news/NewsList'
import { SentimentBadge } from '@/components/instruments/SentimentBadge'
import { InstrumentWithArticles } from '@/types'

const typeLabel: Record<string, string> = {
  stock: '股票',
  crypto: '加密货币',
  commodity: '大宗商品',
  forex: '外汇',
}

async function getInstrument(symbol: string): Promise<InstrumentWithArticles | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(
    `${baseUrl}/api/instruments/${encodeURIComponent(symbol)}`,
    { cache: 'no-store' }
  )
  if (!res.ok) return null
  return res.json()
}

export default async function InstrumentPage({
  params,
}: {
  params: Promise<{ symbol: string }>
}) {
  const { symbol } = await params
  const instrument = await getInstrument(decodeURIComponent(symbol))

  if (!instrument) notFound()

  const articles = instrument.articles.map((a) => a.article)

  // Aggregate sentiments
  const sentimentCounts = articles.reduce(
    (acc, a) => {
      if (a.sentiment) acc[a.sentiment] = (acc[a.sentiment] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  const dominantSentiment =
    Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
          ← 返回
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{instrument.symbol}</h1>
              <p className="text-gray-600 mt-1">{instrument.name}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="rounded-full border px-3 py-1 text-sm text-gray-600">
                {typeLabel[instrument.type] ?? instrument.type}
              </span>
              {dominantSentiment && <SentimentBadge sentiment={dominantSentiment} />}
            </div>
          </div>

          <div className="mt-4 flex gap-4 text-sm text-gray-500">
            <span>{articles.length} 条相关新闻</span>
            {instrument.exchange && <span>交易所: {instrument.exchange}</span>}
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-4">相关新闻</h2>
        <NewsList articles={articles} />
      </div>
    </main>
  )
}
