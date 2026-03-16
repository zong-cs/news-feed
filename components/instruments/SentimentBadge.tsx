import { Sentiment } from '@/types'

const config: Record<Sentiment, { label: string; className: string }> = {
  bullish: { label: '看涨', className: 'bg-green-100 text-green-800' },
  bearish: { label: '看跌', className: 'bg-red-100 text-red-800' },
  neutral: { label: '中性', className: 'bg-gray-100 text-gray-700' },
}

export function SentimentBadge({ sentiment }: { sentiment: string | null }) {
  const s = (sentiment ?? 'neutral') as Sentiment
  const { label, className } = config[s] ?? config.neutral
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
