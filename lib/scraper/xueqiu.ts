import { BaseScraper, ScrapedArticle } from './base'

// 雪球 — JSON API
export class XueQiuScraper extends BaseScraper {
  constructor() {
    super('xueqiu')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    const url =
      'https://xueqiu.com/v4/statuses/public_timeline_by_category.json?since_id=-1&max_id=-1&count=20&category=1'
    const res = await this.fetchWithRateLimit(url)
    if (!res.ok) return []

    try {
      const data = await res.json()
      const list: any[] = data?.list ?? []
      console.log('[xueqiu] fetched', list.length, 'items')
      return list.slice(0, 20).map((item) => ({
        url: `https://xueqiu.com${item.target ?? ''}`,
        title: item.title ?? item.text?.slice(0, 80) ?? '',
        content: item.text ?? item.title ?? '',
        source: 'xueqiu',
        publishedAt: item.created_at ? new Date(item.created_at) : new Date(),
      }))
    } catch (err) {
      console.error('[xueqiu] parse error:', err)
      return []
    }
  }
}
