import { BaseScraper, ScrapedArticle } from './base'

// Blockworks — Playwright
export class BlockworksScraper extends BaseScraper {
  constructor() {
    super('blockworks')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const items = await this.withPage(
        browser,
        'https://blockworks.co/news',
        async (page) => {
          return page.evaluate(() => {
            const links = Array.from(
              document.querySelectorAll('a[class*="article"], h3 a, h2 a, .post-card a')
            )
            const seen = new Set<string>()
            return links.slice(0, 20).map((a) => ({
              href: (a as HTMLAnchorElement).href,
              title: a.textContent?.trim() ?? '',
            })).filter((i) => {
              if (!i.title || !i.href.includes('blockworks.co/news/') || seen.has(i.href)) return false
              seen.add(i.href)
              return true
            })
          })
        }
      )

      console.log('[blockworks] fetched', items.length, 'items')
      return items.slice(0, 15).map((item) => ({
        url: item.href,
        title: item.title,
        content: item.title,
        source: 'blockworks',
        publishedAt: new Date(),
      }))
    })
  }
}
