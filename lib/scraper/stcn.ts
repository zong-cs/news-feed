import { BaseScraper, ScrapedArticle } from './base'

// 证券时报 — Playwright
export class STCNScraper extends BaseScraper {
  constructor() {
    super('stcn')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const items = await this.withPage(
        browser,
        'https://www.stcn.com/article/list/kuaixun.html',
        async (page) => {
          return page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('.news-list a'))
            return links.slice(0, 20).map((a) => ({
              href: (a as HTMLAnchorElement).href,
              title: a.textContent?.trim() ?? '',
            }))
          })
        }
      )

      return items
        .filter((i) => i.href && i.title)
        .slice(0, 15)
        .map((item) => ({
          url: item.href,
          title: item.title,
          content: item.title,
          source: 'stcn',
          publishedAt: new Date(),
        }))
    })
  }
}
