import { prisma } from '@/lib/db'
import { getScraperForSource } from '@/lib/scraper'

export async function runScrapeJob(source: string): Promise<{ count: number }> {
  // Mark job as running
  await prisma.scrapeJob.upsert({
    where: { source },
    create: { source, status: 'running' },
    update: { status: 'running', error: null },
  })

  try {
    const scraper = getScraperForSource(source)
    const articles = await scraper.scrape()

    let count = 0
    for (const article of articles) {
      try {
        await prisma.newsArticle.upsert({
          where: { url: article.url },
          create: {
            url: article.url,
            title: article.title,
            content: article.content,
            rawHtml: process.env.STORE_RAW_HTML === 'true' ? article.rawHtml : null,
            source: article.source,
            publishedAt: article.publishedAt,
            // Skip AI article analysis for all sources — only futures fundamental/technical analysis is used
            aiProcessed: true,
          },
          update: {},
        })
        count++
      } catch {
        // Skip duplicates
      }
    }

    await prisma.scrapeJob.update({
      where: { source },
      data: { status: 'idle', lastRun: new Date(), count },
    })

    return { count }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    await prisma.scrapeJob.update({
      where: { source },
      data: { status: 'error', error, lastRun: new Date() },
    })
    throw err
  }
}
