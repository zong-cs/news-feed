import { BaseScraper, ScrapedArticle } from './base'

// 东方财富 — 公开 JSON API
export class EastMoneyScraper extends BaseScraper {
  constructor() {
    super('eastmoney')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    const url =
      'https://newsapi.eastmoney.com/kuaixun/v1/getlist_102_ajaxResult_50_1_.html'
    const res = await this.fetchWithRateLimit(url)
    if (!res.ok) return []

    const text = await res.text()
    // Response is JSONP-like: var ajaxResult={...}
    const match = text.match(/ajaxResult\s*=\s*(\{[\s\S]*\})/)
    if (!match) return []

    try {
      const data = JSON.parse(match[1])
      const list: any[] = data?.LivesList ?? []
      console.log('[eastmoney] fetched', list.length, 'items')
      return list.slice(0, 20).map((item) => ({
        url: item.url_w ?? `https://finance.eastmoney.com/a/${item.id}.html`,
        title: item.title ?? '',
        content: item.digest ?? item.title ?? '',
        source: 'eastmoney',
        publishedAt: item.showtime ? new Date(item.showtime) : new Date(),
      }))
    } catch (err) {
      console.error('[eastmoney] parse error:', err)
      return []
    }
  }
}
