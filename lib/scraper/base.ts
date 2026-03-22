import { chromium, Browser, Page } from 'playwright'

export interface ScrapedArticle {
  url: string
  title: string
  content: string
  rawHtml?: string
  source: string
  publishedAt: Date
}

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// Per-domain rate limiting: 1 req / 2s + 0-500ms jitter
const lastRequestTime: Record<string, number> = {}

async function rateLimit(domain: string): Promise<void> {
  const now = Date.now()
  const last = lastRequestTime[domain] ?? 0
  const wait = 2000 + Math.random() * 500 - (now - last)
  if (wait > 0) await sleep(wait)
  lastRequestTime[domain] = Date.now()
}

export abstract class BaseScraper {
  protected sourceName: string

  constructor(sourceName: string) {
    this.sourceName = sourceName
  }

  abstract scrape(): Promise<ScrapedArticle[]>

  protected async withBrowser<T>(fn: (browser: Browser) => Promise<T>): Promise<T> {
    const browser = await chromium.launch({ headless: true })
    try {
      return await fn(browser)
    } finally {
      await browser.close()
    }
  }

  protected async withPage<T>(
    browser: Browser,
    url: string,
    fn: (page: Page) => Promise<T>
  ): Promise<T> {
    const domain = new URL(url).hostname
    await rateLimit(domain)

    const page = await browser.newPage()
    await page.setExtraHTTPHeaders({ 'User-Agent': randomUA() })
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      return await fn(page)
    } finally {
      await page.close()
    }
  }

  protected async fetchWithRateLimit(url: string): Promise<Response> {
    const domain = new URL(url).hostname
    await rateLimit(domain)
    return fetch(url, {
      headers: { 'User-Agent': randomUA() },
      signal: AbortSignal.timeout(15000),
    })
  }
}
