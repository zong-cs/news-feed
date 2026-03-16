import { prisma } from '@/lib/db'
import { analyzeArticle } from './claude'

export async function processPendingArticles(batchSize = 10): Promise<number> {
  const articles = await prisma.newsArticle.findMany({
    where: { aiProcessed: false },
    orderBy: { publishedAt: 'desc' },
    take: batchSize,
  })

  console.log('[ai] pending articles:', articles.length)

  let processed = 0

  for (const article of articles) {
    const result = await analyzeArticle(article.title, article.content)
    console.log('[ai] article', article.id, result ? 'ok' : 'failed')

    if (!result) {
      await prisma.newsArticle.update({
        where: { id: article.id },
        data: { aiProcessed: true },
      })
      continue
    }

    // Upsert instruments and link to article
    for (const inst of result.instruments) {
      const instrument = await prisma.tradingInstrument.upsert({
        where: { symbol: inst.symbol },
        create: {
          symbol: inst.symbol,
          name: inst.name,
          type: inst.type,
          exchange: inst.exchange ?? null,
        },
        update: {
          name: inst.name,
          exchange: inst.exchange ?? undefined,
        },
      })

      await prisma.articleInstrument.upsert({
        where: {
          articleId_instrumentId: {
            articleId: article.id,
            instrumentId: instrument.id,
          },
        },
        create: {
          articleId: article.id,
          instrumentId: instrument.id,
          relevance: inst.relevance,
        },
        update: { relevance: inst.relevance },
      })
    }

    await prisma.newsArticle.update({
      where: { id: article.id },
      data: {
        summary: result.summary,
        sentiment: result.sentiment,
        keyDataPoints: JSON.stringify(result.keyDataPoints),
        aiProcessed: true,
      },
    })

    processed++
  }

  return processed
}
