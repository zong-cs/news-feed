import { BaseScraper, ScrapedArticle } from './base'

// X/Twitter public search — best-effort
export class TwitterScraper extends BaseScraper {
  private queries: string[]

  constructor() {
    super('twitter')
    this.queries = ['$BTC', '$ETH', '$AAPL', 'stock market', 'crypto market']
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const articles: ScrapedArticle[] = []

      for (const query of this.queries.slice(0, 2)) {
        try {
          const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(query)}&f=live`
          const tweets = await this.withPage(browser, searchUrl, async (page) => {
            await page.waitForTimeout(3000)
            return page.evaluate(() => {
              const tweetEls = Array.from(
                document.querySelectorAll('[data-testid="tweet"]')
              )
              return tweetEls.slice(0, 5).map((el) => {
                const text = el.querySelector('[data-testid="tweetText"]')?.textContent ?? ''
                const link = el.querySelector('a[href*="/status/"]') as HTMLAnchorElement
                return {
                  text,
                  href: link?.href ?? '',
                }
              })
            })
          })

          for (const tweet of tweets) {
            if (!tweet.text || !tweet.href) continue
            articles.push({
              url: tweet.href,
              title: tweet.text.slice(0, 100),
              content: tweet.text,
              source: 'twitter',
              publishedAt: new Date(),
            })
          }
        } catch {
          // best-effort
        }
      }

      return articles
    })
  }
}
