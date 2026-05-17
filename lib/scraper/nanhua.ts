import { BaseScraper, ScrapedArticle } from './base'

// 南华期货 — 研究报告 JSON API
// API: https://www.nanhua.net/jSearch/queryNewsListByTypeForJson.shtm?site=newnanhua&type=101
// type=101 => 公司公告/交易所公告等期货行业资讯（total ~5000+）
export class NanhuaScraper extends BaseScraper {
  constructor() {
    super('nanhua')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    const url =
      'https://www.nanhua.net/jSearch/queryNewsListByTypeForJson.shtm?site=newnanhua&type=101&start=0&limit=15'

    let data: any
    try {
      const res = await this.fetchWithRateLimit(url)
      if (!res.ok) {
        console.error('[nanhua] API error:', res.status)
        return []
      }
      data = await res.json()
    } catch (err) {
      console.error('[nanhua] fetch error:', err)
      return []
    }

    const list: any[] = data?.recordList ?? []
    console.log('[nanhua] fetched', list.length, 'items')

    return list.slice(0, 15).map((item) => {
      const relUrl: string = item.url ?? item.href ?? ''
      const fullUrl = relUrl.startsWith('http')
        ? relUrl
        : `https://www.nanhua.net${relUrl}`

      const publishedAt = item.createTime
        ? new Date(item.createTime)
        : new Date()

      return {
        url: fullUrl || `https://www.nanhua.net/news/${item.newsId}`,
        title: (item.subject ?? '').trim(),
        content: (item.summary ?? item.content ?? item.subject ?? '').trim().slice(0, 6000),
        source: 'nanhua',
        publishedAt,
      }
    })
  }
}
