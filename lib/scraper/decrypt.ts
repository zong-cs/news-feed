import { BaseScraper, ScrapedArticle } from './base'

// Decrypt — Playwright
export class DecryptScraper extends BaseScraper {
  constructor() {
    super('decrypt')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const items = await this.withPage(
        browser,
        'https://decrypt.co/news',
        async (page) => {
          return page.evaluate(() => {
            const links = Array.from(
              document.querySelectorAll('a[class*="article"], h3 a, h2 a')
            )
            const seen = new Set<string>()
            return links.slice(0, 20).map((a) => ({
              href: (a as HTMLAnchorElement).href,
              title: a.textContent?.trim() ?? '',
            })).filter((i) => {
              if (!i.title || !i.href.startsWith('https://decrypt.co/') || seen.has(i.href)) return false
              seen.add(i.href)
              return true
            })
          })
        }
      )

      console.log('[decrypt] fetched', items.length, 'items')
      return items.slice(0, 15).map((item) => ({
        url: item.href,
        title: item.title,
        content: item.title,
        source: 'decrypt',
        publishedAt: new Date(),
      }))
    })
  }
}
