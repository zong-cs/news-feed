import { BaseScraper, ScrapedArticle } from './base'

// 同花顺期货 — Playwright，GBK 编码页面
export class THSFuturesScraper extends BaseScraper {
  constructor() {
    super('thsfutures')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const listUrl = 'https://goodsfu.10jqka.com.cn/futuresnews_list/'
      const articles: ScrapedArticle[] = []

      const links = await this.withPage(browser, listUrl, async (page) => {
        // Playwright handles GBK encoding automatically via DOM
        await page.waitForTimeout(2000)
        const anchors = await page.$$eval(
          '.news-list a, .list-item a, .news-item a, ul.list a, .m-list a',
          (els) =>
            els.slice(0, 15).map((el) => ({
              href: (el as HTMLAnchorElement).href,
              title: el.textContent?.trim() ?? '',
            }))
        )
        // Fallback: grab any links with news-like URLs
        if (anchors.length === 0) {
          const fallback = await page.$$eval('a[href*="futuresnews"]', (els) =>
            els.slice(0, 15).map((el) => ({
              href: (el as HTMLAnchorElement).href,
              title: el.textContent?.trim() ?? '',
            }))
          )
          return fallback
        }
        return anchors
      })

      console.log('[thsfutures] found', links.length, 'links')

      for (const link of links.filter((l) => l.href && l.title)) {
        try {
          const content = await this.withPage(browser, link.href, async (page) => {
            await page.waitForTimeout(1500)
            const text = await page.$eval(
              '.article-content, .news-content, .content, article',
              (el) => el.textContent?.trim() ?? ''
            ).catch(() => '')
            return text.slice(0, 6000)
          })

          articles.push({
            url: link.href,
            title: link.title,
            content: content || link.title,
            source: 'thsfutures',
            publishedAt: new Date(),
          })
        } catch (err) {
          console.error('[thsfutures] error processing', link.href, err)
        }
      }

      return articles
    })
  }
}
