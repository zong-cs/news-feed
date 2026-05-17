import { BaseScraper, ScrapedArticle } from './base'

// 银河期货 — Playwright 抓研报列表（宏观研究 + 行情日报）
// 网站用阿里云WAF，需浏览器渲染，研报列表页 https://www.yhqh.com.cn/col15/list.html
export class YHQHScraper extends BaseScraper {
  constructor() {
    super('yhqh')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const articles: ScrapedArticle[] = []

      // 宏观研究列表
      const links = await this.withPage(browser, 'https://www.yhqh.com.cn/col15/list.html', async (page) => {
        await page.waitForTimeout(3000)
        return page.$$eval('a[href*="/col"]', (els) =>
          (els as HTMLAnchorElement[])
            .filter((a) => {
              const text = a.textContent?.trim() ?? ''
              const href = a.href
              return text.length > 5 && !href.includes('list.html') && !href.includes('index.html')
            })
            .slice(0, 20)
            .map((a) => ({
              href: a.href,
              title: a.textContent?.trim() ?? '',
            }))
        ).catch(() => [] as { href: string; title: string }[])
      })

      console.log('[yhqh] found', links.length, 'links')

      for (const link of links.slice(0, 15)) {
        if (!link.title) continue
        articles.push({
          url: link.href,
          title: link.title,
          content: link.title,
          source: 'yhqh',
          publishedAt: new Date(),
        })
      }

      return articles
    })
  }
}
