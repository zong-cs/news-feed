import { BaseScraper, ScrapedArticle } from './base'

// 同花顺 — Playwright
export class TongHuaShunScraper extends BaseScraper {
  constructor() {
    super('tonghuashun')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const items = await this.withPage(
        browser,
        'https://news.10jqka.com.cn/',
        async (page) => {
          return page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('.news-list a, .list a, ul.list li a'))
            return links.slice(0, 20).map((a) => ({
              href: (a as HTMLAnchorElement).href,
              title: a.textContent?.trim() ?? '',
            })).filter((i) => i.title && i.href.startsWith('http'))
          })
        }
      )

      console.log('[tonghuashun] fetched', items.length, 'items')
      return items.slice(0, 15).map((item) => ({
        url: item.href,
        title: item.title,
        content: item.title,
        source: 'tonghuashun',
        publishedAt: new Date(),
      }))
    })
  }
}
