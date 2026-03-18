import { BaseScraper, ScrapedArticle } from './base'

// CNBC — Playwright
export class CNBCScraper extends BaseScraper {
  constructor() {
    super('cnbc')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const items = await this.withPage(
        browser,
        'https://www.cnbc.com/finance/',
        async (page) => {
          return page.evaluate(() => {
            const links = Array.from(
              document.querySelectorAll('a.Card-title, a[class*="headline"], .Card a')
            )
            const seen = new Set<string>()
            return links.slice(0, 20).map((a) => ({
              href: (a as HTMLAnchorElement).href,
              title: a.textContent?.trim() ?? '',
            })).filter((i) => {
              if (!i.title || !i.href.includes('cnbc.com') || seen.has(i.href)) return false
              seen.add(i.href)
              return true
            })
          })
        }
      )

      console.log('[cnbc] fetched', items.length, 'items')
      return items.slice(0, 15).map((item) => ({
        url: item.href,
        title: item.title,
        content: item.title,
        source: 'cnbc',
        publishedAt: new Date(),
      }))
    })
  }
}
