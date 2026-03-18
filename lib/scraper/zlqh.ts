import { BaseScraper, ScrapedArticle } from './base'

// 中粮期货 — JSON API，含 aiSummary 字段
export class ZLQHScraper extends BaseScraper {
  constructor() {
    super('zlqh')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    const apiUrl =
      'https://zxpt.zlqh.com/prod-api/system/reportInfo/appList?pageSize=10&pageNum=1'

    const res = await this.fetchWithRateLimit(apiUrl)
    if (!res.ok) {
      console.error('[zlqh] API error:', res.status)
      return []
    }

    let data: any
    try {
      data = await res.json()
    } catch (err) {
      console.error('[zlqh] JSON parse error:', err)
      return []
    }

    const list: any[] = data?.rows ?? data?.data?.rows ?? data?.list ?? []
    console.log('[zlqh] fetched', list.length, 'items')

    return list.slice(0, 10).map((item) => {
      const rawSummary: string = item.aiSummary ?? item.reportSummary ?? item.summary ?? ''
      const content = stripHtml(rawSummary) || (item.reportTitle ?? '').trim()

      const publishedAt = item.publishTime ?? item.createTime
        ? new Date(item.publishTime ?? item.createTime)
        : new Date()

      return {
        url: item.reportUrl ?? `https://zxpt.zlqh.com/report/${item.id}`,
        title: (item.reportTitle ?? item.title ?? '').trim(),
        content,
        source: 'zlqh',
        publishedAt,
      }
    })
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
