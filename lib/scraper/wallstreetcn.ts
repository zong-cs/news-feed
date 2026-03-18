import { BaseScraper, ScrapedArticle } from './base'

// 华尔街见闻 — Playwright
export class WallStreetCNScraper extends BaseScraper {
  constructor() {
    super('wallstreetcn')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const items = await this.withPage(
        browser,
        'https://wallstreetcn.com/news/global',
        async (page) => {
          return page.evaluate(() => {
            const links = Array.from(
              document.querySelectorAll('a.article-item__title, a[class*="title"]')
            )
            return links.slice(0, 20).map((a) => ({
              href: (a as HTMLAnchorElement).href,
              title: a.textContent?.trim() ?? '',
            })).filter((i) => i.title && i.href.startsWith('http'))
          })
        }
      )

      console.log('[wallstreetcn] fetched', items.length, 'items')
      return items.slice(0, 15).map((item) => ({
        url: item.href,
        title: item.title,
        content: item.title,
        source: 'wallstreetcn',
        publishedAt: new Date(),
      }))
    })
  }
}
