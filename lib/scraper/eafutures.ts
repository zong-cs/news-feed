import { BaseScraper, ScrapedArticle } from './base'
// pdf-parse uses CommonJS exports — use require for compatibility
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>

// 东亚期货 — Playwright 抓研报列表，PDF 下载解析
export class EAFuturesScraper extends BaseScraper {
  constructor() {
    super('eafutures')
  }

  async scrape(): Promise<ScrapedArticle[]> {
    return this.withBrowser(async (browser) => {
      const listUrl = 'https://www.eafutures.com/dyyjy'
      const articles: ScrapedArticle[] = []

      const links = await this.withPage(browser, listUrl, async (page) => {
        await page.waitForSelector('a[href*="/preview?id="]', { timeout: 15000 }).catch(() => {})
        const anchors = await page.$$eval('a[href*="/preview?id="]', (els) =>
          els.slice(0, 15).map((el) => ({
            href: (el as HTMLAnchorElement).href,
            title: el.textContent?.trim() ?? '',
          }))
        )
        return anchors
      })

      console.log('[eafutures] found', links.length, 'links')

      for (const link of links) {
        try {
          const content = await this.fetchPdfContent(browser, link.href)
          articles.push({
            url: link.href,
            title: link.title || 'East Asia Futures Report',
            content: content || link.title,
            source: 'eafutures',
            publishedAt: new Date(),
          })
        } catch (err) {
          console.error('[eafutures] error processing', link.href, err)
          articles.push({
            url: link.href,
            title: link.title || 'East Asia Futures Report',
            content: link.title,
            source: 'eafutures',
            publishedAt: new Date(),
          })
        }
      }

      return articles
    })
  }

  private async fetchPdfContent(browser: import('playwright').Browser, previewUrl: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const page = await browser.newPage()
      let resolved = false

      page.on('download', async (download) => {
        try {
          const path = await download.path()
          if (!path) { resolve(''); return }
          const fs = await import('fs/promises')
          const buf = await fs.readFile(path)
          const parsed = await pdfParse(buf)
          resolved = true
          resolve(parsed.text.slice(0, 6000))
        } catch (err) {
          resolve('')
        } finally {
          await page.close().catch(() => {})
        }
      })

      try {
        await page.goto(previewUrl, { waitUntil: 'domcontentloaded', timeout: 20000 })
        // Wait a bit for download to trigger
        await new Promise((r) => setTimeout(r, 5000))
        if (!resolved) {
          resolve('')
          await page.close().catch(() => {})
        }
      } catch (err) {
        if (!resolved) reject(err)
        await page.close().catch(() => {})
      }
    })
  }
}
