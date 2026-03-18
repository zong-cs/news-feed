import { prisma } from '@/lib/db'
import { getScraperForSource } from '@/lib/scraper'
import { processPendingArticles } from '@/lib/ai/process-article'

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
            // zlqh already has AI summary — skip re-analysis
            aiProcessed: article.source === 'zlqh',
          },
          update: {},
        })
        count++
      } catch {
        // Skip duplicates
      }
    }

    // Run AI processing on new articles
    await processPendingArticles(20)

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
