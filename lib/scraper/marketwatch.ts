import { BaseScraper, ScrapedArticle } from './base'

// MarketWatch — Playwright
export class MarketWatchScraper extends BaseScraper {
  constructor() {
    super('marketwatch')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const items = await this.withPage(
        browser,
        'https://www.marketwatch.com/latest-news',
        async (page) => {
          return page.evaluate(() => {
            const links = Array.from(
              document.querySelectorAll('a.link--title, h3.article__headline a, .article__content a')
            )
            const seen = new Set<string>()
            return links.slice(0, 20).map((a) => ({
              href: (a as HTMLAnchorElement).href,
              title: a.textContent?.trim() ?? '',
            })).filter((i) => {
              if (!i.title || !i.href.includes('marketwatch.com') || seen.has(i.href)) return false
              seen.add(i.href)
              return true
            })
          })
        }
      )

      console.log('[marketwatch] fetched', items.length, 'items')
      return items.slice(0, 15).map((item) => ({
        url: item.href,
        title: item.title,
        content: item.title,
        source: 'marketwatch',
        publishedAt: new Date(),
      }))
    })
  }
}
