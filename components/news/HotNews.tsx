'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface HotArticle {
  id: number
  url: string
  title: string
  summary: string | null
  sentiment: string | null
  source: string
  publishedAt: string
}

const sourceLabel: Record<string, string> = {
  reuters: 'Reuters',
  ft: 'FT',
  bloomberg: 'Bloomberg',
  cnbc: 'CNBC',
  marketwatch: 'MarketWatch',
  cls: '财联社',
  eastmoney: '东方财富',
  wallstreetcn: '华尔街见闻',
  sina: '新浪财经',
  stcn: '证券时报',
}

export function HotNews() {
  const [articles, setArticles] = useState<HotArticle[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const res = await fetch('/api/news/hot?limit=6')
      if (res.ok) setArticles(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        暂无宏观新闻，请先在 Admin 页面触发爬取
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {articles.map((article) => (
        <a
          key={article.id}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl border border-slate-700 bg-slate-800/60 p-4 hover:border-slate-500 hover:bg-slate-800 transition-all"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-medium text-slate-100 line-clamp-2 flex-1">
              {article.title}
            </h3>
          </div>
          {article.summary && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-3">{article.summary}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-400">
              {sourceLabel[article.source] ?? article.source}
            </span>
            <span>·</span>
            <span>
              {formatDistanceToNow(new Date(article.publishedAt), {
                addSuffix: true,
                locale: zhCN,
              })}
            </span>
          </div>
        </a>
      ))}
    </div>
  )
}
