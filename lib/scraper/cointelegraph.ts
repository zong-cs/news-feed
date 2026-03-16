import { BaseScraper, ScrapedArticle } from './base'

export class CoinTelegraphScraper extends BaseScraper {
  constructor() {
    super('cointelegraph')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const items = await this.withPage(
        browser,
        'https://cointelegraph.com/tags/markets',
        async (page) => {
          return page.evaluate(() => {
            const links = Array.from(
              document.querySelectorAll('article a.post-card__title-link')
            )
            return links.slice(0, 15).map((a) => ({
              href: (a as HTMLAnchorElement).href,
              title: a.textContent?.trim() ?? '',
            }))
          })
        }
      )

      const articles: ScrapedArticle[] = []
      for (const item of items.filter((i) => i.href && i.title).slice(0, 10)) {
        try {
          const content = await this.withPage(browser, item.href, async (page) => {
            return page.evaluate(() => {
              const paras = Array.from(
                document.querySelectorAll('.post-content p')
              )
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
            source: 'cointelegraph',
            publishedAt: new Date(),
          })
        } catch {
          articles.push({
            url: item.href,
            title: item.title,
            content: item.title,
            source: 'cointelegraph',
            publishedAt: new Date(),
          })
        }
      }

      return articles
    })
  }
}
