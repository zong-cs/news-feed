import { BaseScraper, ScrapedArticle } from './base'

// 华泰期货 — Playwright 抓研报列表
// 网站为纯 JS SPA，研报列表页 http://www.htqh.com.cn/research/report/
export class HTQHScraper extends BaseScraper {
  constructor() {
    super('htqh')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const listUrl = 'http://www.htqh.com.cn/research/report/'

      const items = await this.withPage(browser, listUrl, async (page) => {
        // Wait for report list to render
        await page.waitForSelector('.report-item, .research-item, .list-item, li a', {
          timeout: 15000,
        }).catch(() => {})
        await page.waitForTimeout(2000)

        // Try various selectors the SPA might use
        const results = await page.evaluate(() => {
          const anchors = Array.from(document.querySelectorAll('a[href]'))
          return anchors
            .filter((a) => {
              const href = (a as HTMLAnchorElement).href
              const text = a.textContent?.trim() ?? ''
              return (
                text.length > 5 &&
                (href.includes('/research/') || href.includes('/report/') || href.includes('/article/')) &&
                !href.includes('#')
              )
            })
            .slice(0, 20)
            .map((a) => ({
              href: (a as HTMLAnchorElement).href,
              title: a.textContent?.trim() ?? '',
            }))
        })
        return results
      })

      console.log('[htqh] found', items.length, 'links')

      const articles: ScrapedArticle[] = []
      for (const item of items.slice(0, 15)) {
        if (!item.title) continue
        articles.push({
          url: item.href,
          title: item.title,
          content: item.title,
          source: 'htqh',
          publishedAt: new Date(),
        })
      }

      return articles
    })
  }
}
