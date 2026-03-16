import { BaseScraper, ScrapedArticle } from './base'

export class BloombergScraper extends BaseScraper {
  constructor() {
    super('bloomberg')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const articles: ScrapedArticle[] = []

      const items = await this.withPage(
        browser,
        'https://www.bloomberg.com/markets',
        async (page) => {
          return page.evaluate(() => {
            const links = Array.from(
              document.querySelectorAll('a[data-component="headline"]')
            )
            return links.slice(0, 15).map((a) => ({
              href: (a as HTMLAnchorElement).href,
              title: a.textContent?.trim() ?? '',
            }))
          })
        }
      )

      for (const item of items.slice(0, 10)) {
        if (!item.href || !item.title) continue
        articles.push({
          url: item.href,
          title: item.title,
          content: item.title,
          source: 'bloomberg',
          publishedAt: new Date(),
        })
      }

      return articles
    })
  }
}
