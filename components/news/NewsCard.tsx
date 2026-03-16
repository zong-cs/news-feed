import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Article } from '@/types'
import { SentimentBadge } from '../instruments/SentimentBadge'

const sourceLabel: Record<string, string> = {
  reuters: 'Reuters',
  ft: 'FT',
  bloomberg: 'Bloomberg',
  eastmoney: '东方财富',
  cls: '财联社',
  stcn: '证券时报',
  coindesk: 'CoinDesk',
  cointelegraph: 'CoinTelegraph',
  twitter: 'X/Twitter',
}

export function NewsCard({ article }: { article: Article }) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
    locale: zhCN,
  })

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
          {article.title}
        </h3>
        {article.sentiment && <SentimentBadge sentiment={article.sentiment} />}
      </div>

      {article.summary && (
        <p className="mt-2 text-xs text-gray-500 line-clamp-2">{article.summary}</p>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
        <span className="font-medium text-gray-500">
          {sourceLabel[article.source] ?? article.source}
        </span>
        <span>·</span>
        <span>{timeAgo}</span>
      </div>
    </a>
  )
}
