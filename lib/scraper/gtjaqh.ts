import { BaseScraper, ScrapedArticle } from './base'

// 国泰君安期货 — Next.js SSR 数据接口
// 研报列表嵌在 /_next/data/{buildId}/pc/report.json 中
// buildId 从首页 HTML 动态获取
export class GTJAQHScraper extends BaseScraper {
  private buildId: string | null = null

  constructor() {
    super('gtjaqh')
  }

  private async fetchBuildId(): Promise<string | null> {
    try {
      const res = await this.fetchWithRateLimit('https://www.gtjaqh.com/')
      if (!res.ok) return null
      const html = await res.text()
      const m = html.match(/"buildId":"([^"]+)"/)
      return m ? m[1] : null
    } catch {
      return null
    }
  }

  async scrape(): Promise<ScrapedArticle[]> {
    if (!this.buildId) {
      this.buildId = await this.fetchBuildId()
      if (!this.buildId) {
        console.error('[gtjaqh] could not get buildId')
        return []
      }
      console.log('[gtjaqh] buildId:', this.buildId)
    }

    const url = `https://www.gtjaqh.com/_next/data/${this.buildId}/pc/report.json`

    let data: any
    try {
      const res = await this.fetchWithRateLimit(url)
      if (!res.ok) {
        // buildId may have rotated — clear cache
        this.buildId = null
        console.error('[gtjaqh] data fetch error:', res.status)
        return []
      }
      data = await res.json()
    } catch (err) {
      this.buildId = null
      console.error('[gtjaqh] parse error:', err)
      return []
    }

    const reports: any[] = data?.pageProps?.TYBREPORT ?? []
    console.log('[gtjaqh] fetched', reports.length, 'reports')

    // Deduplicate by title (list contains duplicates)
    const seen = new Set<string>()
    const articles: ScrapedArticle[] = []

    for (const rpt of reports) {
      const title: string = (rpt.title ?? '').trim()
      if (!title || seen.has(title)) continue
      seen.add(title)

      const id: string = rpt.id ?? ''
      const articleUrl = id
        ? `https://www.gtjaqh.com/pc/reportDetail/${id}`
        : 'https://www.gtjaqh.com/pc/report.html'

      const publishedAt = rpt.time ? new Date(rpt.time) : new Date()

      // imagetxt = report type label (日报/周报/月报/合集 etc.)
      const typeLabel: string = rpt.imagetxt ?? ''
      const content = typeLabel ? `[${typeLabel}] ${title}` : title

      articles.push({
        url: articleUrl,
        title,
        content,
        source: 'gtjaqh',
        publishedAt,
      })
    }

    return articles
  }
}
