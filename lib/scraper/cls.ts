import { BaseScraper, ScrapedArticle } from './base'

// 财联社 — 公开 JSON API
export class CLSScraper extends BaseScraper {
  constructor() {
    super('cls')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    const url = 'https://www.cls.cn/api/sw?app=CLS&sv=7.7.5&os=web'
    const apiUrl = `https://www.cls.cn/nodeapi/telegraphs?app=CLS&os=web&sv=7.7.5&rn=20&last_time=0`

    const res = await this.fetchWithRateLimit(apiUrl)
    if (!res.ok) return []

    try {
      const data = await res.json()
      const list: any[] = data?.data?.roll_data ?? []
      return list.slice(0, 20).map((item) => ({
        url: `https://www.cls.cn/detail/${item.id}`,
        title: item.title ?? item.brief ?? '',
        content: item.content ?? item.brief ?? item.title ?? '',
        source: 'cls',
        publishedAt: item.ctime ? new Date(item.ctime * 1000) : new Date(),
      }))
    } catch {
      return []
    }
  }
}
