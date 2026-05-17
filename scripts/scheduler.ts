/**
 * Standalone cron scheduler for news-feed.
 * Run with: npm run scheduler
 *
 * Schedule:
 * - Crypto sources:  every hour
 * - Stock sources:   every hour
 * - Futures sources: every day at 08:00 and 22:00 (scrape + AI refresh)
 */

import cron from 'node-cron'
import { runScrapeJob } from '../lib/news/scrape-job'
import { refreshFuturesAnalysis } from '../lib/futures/refresh'

// ── Source groups ────────────────────────────────────────────────────────────

const CRYPTO_SOURCES = [
  'coindesk',
  'cointelegraph',
  'theblock',
  'decrypt',
  'blockworks',
]

const STOCK_SOURCES = [
  'reuters',
  'ft',
  'bloomberg',
  'eastmoney',
  'cls',
  'stcn',
  'sina',
  'tonghuashun',
  'xueqiu',
  'wallstreetcn',
  'cnbc',
  'marketwatch',
  'seekingalpha',
  'reddit',
  'twitter',
]

const FUTURES_SOURCES = [
  'eafutures',
  'ztqh',
  'zlqh',
  'thsfutures',
  'emfutures',
  'citicsf',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(tag: string, msg: string) {
  console.log(`[${new Date().toISOString()}] [${tag}] ${msg}`)
}

/** Scrape a list of sources sequentially to avoid hammering the network. */
async function scrapeAll(sources: string[], tag: string) {
  log(tag, `starting scrape for ${sources.length} sources`)
  let total = 0
  for (const source of sources) {
    try {
      const { count } = await runScrapeJob(source)
      log(tag, `${source}: +${count} articles`)
      total += count
    } catch (err) {
      log(tag, `${source}: ERROR — ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  log(tag, `done — total new articles: ${total}`)
}

/** Scrape futures sources then run AI analysis refresh. */
async function futuresDailyJob() {
  await scrapeAll(FUTURES_SOURCES, 'futures-scrape')
  log('futures-analysis', 'starting AI refresh')
  try {
    const { updated, varieties } = await refreshFuturesAnalysis()
    log('futures-analysis', `done — updated ${updated} varieties: ${varieties.join(', ')}`)
  } catch (err) {
    log('futures-analysis', `ERROR — ${err instanceof Error ? err.message : String(err)}`)
  }
}

// ── Schedules ────────────────────────────────────────────────────────────────

// Crypto: every hour at :05
cron.schedule('5 * * * *', () => {
  scrapeAll(CRYPTO_SOURCES, 'crypto').catch((err) =>
    log('crypto', `unhandled error: ${err}`)
  )
})

// Stocks: every hour at :20
cron.schedule('20 * * * *', () => {
  scrapeAll(STOCK_SOURCES, 'stocks').catch((err) =>
    log('stocks', `unhandled error: ${err}`)
  )
})

// Futures: 08:00 and 22:00 daily
cron.schedule('0 8 * * *', () => {
  futuresDailyJob().catch((err) => log('futures', `unhandled error: ${err}`))
})

cron.schedule('0 22 * * *', () => {
  futuresDailyJob().catch((err) => log('futures', `unhandled error: ${err}`))
})

// ── Startup ──────────────────────────────────────────────────────────────────

log('scheduler', 'started')
log('scheduler', '  crypto  — every hour at :05')
log('scheduler', '  stocks  — every hour at :20')
log('scheduler', '  futures — daily at 08:00 and 22:00 (scrape + AI refresh)')
