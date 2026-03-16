import { BaseScraper, ScrapedArticle } from './base'

export class CoinDeskScraper extends BaseScraper {
  constructor() {
    super('coindesk')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const items = await this.withPage(
        browser,
        'https://www.coindesk.com/markets/',
        async (page) => {
          return page.evaluate(() => {
            const links = Array.from(
              document.querySelectorAll('a[data-module-name="article-card"]')
            )
            return links.slice(0, 15).map((a) => ({
              href: (a as HTMLAnchorElement).href,
              title:
                a.querySelector('h2,h3')?.textContent?.trim() ??
                a.textContent?.trim() ??
                '',
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
                document.querySelectorAll('.article-body p, [class*="articleBody"] p')
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
            source: 'coindesk',
            publishedAt: new Date(),
          })
        } catch {
          articles.push({
            url: item.href,
            title: item.title,
            content: item.title,
            source: 'coindesk',
            publishedAt: new Date(),
          })
        }
      }

      return articles
    })
  }
}
