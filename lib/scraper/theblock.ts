import { BaseScraper, ScrapedArticle } from './base'

// The Block — Playwright
export class TheBlockScraper extends BaseScraper {
  constructor() {
    super('theblock')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const items = await this.withPage(
        browser,
        'https://www.theblock.co/latest',
        async (page) => {
          return page.evaluate(() => {
            const links = Array.from(
              document.querySelectorAll('a[class*="articleCard"], a[class*="article-card"], .article-card a[href]')
            )
            const seen = new Set<string>()
            return links.slice(0, 20).map((a) => ({
              href: (a as HTMLAnchorElement).href,
              title: a.textContent?.trim() ?? '',
            })).filter((i) => {
              if (!i.title || !i.href.includes('/post/') || seen.has(i.href)) return false
              seen.add(i.href)
              return true
            })
          })
        }
      )

      console.log('[theblock] fetched', items.length, 'items')
      return items.slice(0, 15).map((item) => ({
        url: item.href,
        title: item.title,
        content: item.title,
        source: 'theblock',
        publishedAt: new Date(),
      }))
    })
  }
}
