import { BaseScraper, ScrapedArticle } from './base'

// 中泰期货 — JSON API + HTML 正文抓取
export class ZTQHScraper extends BaseScraper {
  constructor() {
    super('ztqh')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    const apiUrl =
      'https://www.ztqh.com/prod-api/rest/front/getNewsList/2126?pageNum=1&pageSize=10'

    const res = await this.fetchWithRateLimit(apiUrl)
    if (!res.ok) {
      console.error('[ztqh] API error:', res.status)
      return []
    }

    let data: any
    try {
      data = await res.json()
    } catch (err) {
      console.error('[ztqh] JSON parse error:', err)
      return []
    }

    const list: any[] = data?.rows ?? data?.data?.rows ?? data?.list ?? []
    console.log('[ztqh] fetched', list.length, 'items')

    const articles: ScrapedArticle[] = []
    for (const item of list.slice(0, 10)) {
      try {
        const htmlUrl: string = item.htmlUrl ?? ''
        const fullUrl = htmlUrl.startsWith('http')
          ? htmlUrl
          : `https://www.ztqh.com${htmlUrl}`

        let content = item.newsContent ?? item.summary ?? ''

        if (htmlUrl) {
          try {
            const pageRes = await this.fetchWithRateLimit(fullUrl)
            if (pageRes.ok) {
              const html = await pageRes.text()
              content = stripHtml(html).slice(0, 6000)
            }
          } catch {
            // fallback to API content
          }
        }

        const publishedAt = item.publishTime
          ? new Date(item.publishTime)
          : new Date()

        articles.push({
          url: fullUrl || `https://www.ztqh.com/news/${item.id}`,
          title: (item.newsTitle ?? item.title ?? '').trim(),
          content: content || (item.newsTitle ?? ''),
          source: 'ztqh',
          publishedAt,
        })
      } catch (err) {
        console.error('[ztqh] item error:', err)
      }
    }

    return articles
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
