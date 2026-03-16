import { BaseScraper, ScrapedArticle } from './base'

export class FTScraper extends BaseScraper {
  constructor() {
    super('ft')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const articles: ScrapedArticle[] = []

      const items = await this.withPage(
        browser,
        'https://www.ft.com/markets',
        async (page) => {
          return page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a.js-teaser-heading-link'))
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
              const paras = Array.from(document.querySelectorAll('.article__content p'))
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
            source: 'ft',
            publishedAt: new Date(),
          })
        } catch {
          articles.push({
            url: item.href,
            title: item.title,
            content: item.title,
            source: 'ft',
            publishedAt: new Date(),
          })
        }
      }

      return articles
    })
  }
}
