import { BaseScraper, ScrapedArticle } from './base'

// Seeking Alpha — Playwright
export class SeekingAlphaScraper extends BaseScraper {
  constructor() {
    super('seekingalpha')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const items = await this.withPage(
        browser,
        'https://seekingalpha.com/market-news',
        async (page) => {
          return page.evaluate(() => {
            const links = Array.from(
              document.querySelectorAll('a[data-test-id="post-list-item-title"], h3 a, article a')
            )
            const seen = new Set<string>()
            return links.slice(0, 20).map((a) => ({
              href: (a as HTMLAnchorElement).href,
              title: a.textContent?.trim() ?? '',
            })).filter((i) => {
              if (!i.title || !i.href.includes('seekingalpha.com') || seen.has(i.href)) return false
              seen.add(i.href)
              return true
            })
          })
        }
      )

      console.log('[seekingalpha] fetched', items.length, 'items')
      return items.slice(0, 15).map((item) => ({
        url: item.href,
        title: item.title,
        content: item.title,
        source: 'seekingalpha',
        publishedAt: new Date(),
      }))
    })
  }
}
