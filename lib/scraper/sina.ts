import { BaseScraper, ScrapedArticle } from './base'

// 新浪财经 — JSON API
export class SinaScraper extends BaseScraper {
  constructor() {
    super('sina')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    const url =
      'https://feed.mix.sina.com.cn/api/roll/get?pageid=153&lid=2516&k=&num=20&page=1&r=0.5'
    const res = await this.fetchWithRateLimit(url)
    if (!res.ok) return []

    try {
      const data = await res.json()
      const list: any[] = data?.result?.data ?? []
      console.log('[sina] fetched', list.length, 'items')
      return list.slice(0, 20).map((item) => ({
        url: item.url ?? '',
        title: item.title ?? '',
        content: item.intro ?? item.title ?? '',
        source: 'sina',
        publishedAt: item.ctime ? new Date(Number(item.ctime) * 1000) : new Date(),
      }))
    } catch (err) {
      console.error('[sina] parse error:', err)
      return []
    }
  }
}
