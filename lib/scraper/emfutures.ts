import { BaseScraper, ScrapedArticle } from './base'

// 东方财富期货 — Playwright，服务端渲染
export class EMFuturesScraper extends BaseScraper {
  constructor() {
    super('emfutures')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const listUrl = 'https://futures.eastmoney.com/'
      const articles: ScrapedArticle[] = []

      const links = await this.withPage(browser, listUrl, async (page) => {
        await page.waitForTimeout(2000)
        const anchors = await page.$$eval(
          'a[href*="finance.eastmoney.com/a/"]',
          (els) =>
            els.slice(0, 15).map((el) => ({
              href: (el as HTMLAnchorElement).href,
              title: el.textContent?.trim() ?? '',
            }))
        )
        return anchors
      })

      console.log('[emfutures] found', links.length, 'links')

      for (const link of links.filter((l) => l.href && l.title)) {
        try {
          const content = await this.withPage(browser, link.href, async (page) => {
            await page.waitForTimeout(1500)
            const paragraphs = await page.$$eval(
              '.article-content p, #ContentBody p, .newsContent p',
              (els) => els.map((el) => el.textContent?.trim() ?? '').filter(Boolean)
            ).catch(() => [] as string[])
            return paragraphs.join('\n').slice(0, 6000)
          })

          articles.push({
            url: link.href,
            title: link.title,
            content: content || link.title,
            source: 'emfutures',
            publishedAt: new Date(),
          })
        } catch (err) {
          console.error('[emfutures] error processing', link.href, err)
        }
      }

      return articles
    })
  }
}
