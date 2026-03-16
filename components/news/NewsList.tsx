import { Article } from '@/types'
import { NewsCard } from './NewsCard'

export function NewsList({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">暂无新闻</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {articles.map((a) => (
        <NewsCard key={a.id} article={a} />
      ))}
    </div>
  )
}
