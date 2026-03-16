import { BaseScraper, ScrapedArticle } from './base'

export class ReutersScraper extends BaseScraper {
  constructor() {
    super('reuters')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const articles: ScrapedArticle[] = []

      const items = await this.withPage(
        browser,
        'https://www.reuters.com/finance/',
        async (page) => {
          return page.evaluate(() => {
            const links = Array.from(
              document.querySelectorAll('a[data-testid="Heading"]')
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
        try {
          const content = await this.withPage(browser, item.href, async (page) => {
            return page.evaluate(() => {
              const paras = Array.from(document.querySelectorAll('p'))
              return paras
                .map((p) => p.textContent?.trim())
                .filter(Boolean)
                .join('\n')
            })
          })

          articles.push({
            url: item.href,
            title: item.title,
            content: content || item.title,
            source: 'reuters',
            publishedAt: new Date(),
          })
        } catch {
          // Accept paywall truncation
          articles.push({
            url: item.href,
            title: item.title,
            content: item.title,
            source: 'reuters',
            publishedAt: new Date(),
          })
        }
      }

      return articles
    })
  }
}
