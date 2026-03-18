import { BaseScraper, ScrapedArticle } from './base'

// 中信期货 — 研报 JSON API (无需登录)
export class CiticsFScraper extends BaseScraper {
  constructor() {
    super('citicsf')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    const url =
      'https://icsp-server.citicsf.com/icsp-data-provider/api/t0/reportsQuery'
    const body = {
      pageNum: 1,
      pageSize: 20,
      beginDate: null,
      endDate: null,
      title: '',
      userName: '',
      varietyList: [],
      subVarietyList: [],
      reportTypes: ['normal', 'vip'],
      head: { systemVersion: 'MAC', macAddr: '' },
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Referer: 'https://inst.citicsf.com/',
        Origin: 'https://inst.citicsf.com',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) return []

    try {
      const data = await response.json()
      const list: any[] = data?.list ?? []
      console.log('[citicsf] fetched', list.length, 'items')
      return list.slice(0, 20).map((item) => {
        const dateStr: string = item.rptDate ?? ''
        // Format: "20260318000000"
        const publishedAt =
          dateStr.length >= 8
            ? new Date(
                `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
              )
            : new Date()
        return {
          url: `https://inst.citicsf.com/research-report/researchReportQuery?id=${item.id}`,
          title: (item.rptAllTitle ?? '').trim(),
          content: item.rptSummary ?? item.rptAllTitle ?? '',
          source: 'citicsf',
          publishedAt,
        }
      })
    } catch (err) {
      console.error('[citicsf] parse error:', err)
      return []
    }
  }
}
