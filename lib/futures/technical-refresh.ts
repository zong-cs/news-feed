import { prisma } from '@/lib/db'
import { fetchVarietyKData, VARIETY_TO_SYMBOL } from '@/lib/market/ths'
import { analyzeTechnical } from '@/lib/ai/technical-analysis'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function refreshTechnicalAnalysis(): Promise<{ updated: number; varieties: string[] }> {
  // Only analyze varieties that have fundamental analysis and a known symbol
  const analyses = await prisma.futuresVarietyAnalysis.findMany({
    select: { variety: true },
  })

  const varieties = analyses
    .map((a) => a.variety)
    .filter((v) => v in VARIETY_TO_SYMBOL)

  console.log(`[technical/refresh] ${varieties.length} varieties to analyze`)

  const results: string[] = []

  for (const variety of varieties) {
    console.log(`[technical/refresh] fetching kdata for ${variety}`)
    const kdata = await fetchVarietyKData(variety)
    if (!kdata) {
      console.warn(`[technical/refresh] no kdata for ${variety}`)
      continue
    }

    console.log(`[technical/refresh] analyzing ${variety} (daily:${kdata.daily.length} weekly:${kdata.weekly.length})`)
    const ta = await analyzeTechnical(variety, kdata.daily, kdata.weekly)
    if (!ta) {
      console.warn(`[technical/refresh] AI analysis failed for ${variety}`)
      continue
    }

    await prisma.futuresVarietyAnalysis.update({
      where: { variety },
      data: {
        technicalAnalysis: JSON.stringify({ ...ta, symbol: kdata.symbol }),
        technicalUpdatedAt: new Date(),
      },
    })
    results.push(variety)
    console.log(`[technical/refresh] done ${variety}, signal: ${ta.signal}`)

    // Rate limit: 1s between requests
    await sleep(1000)
  }

  console.log(`[technical/refresh] completed, updated ${results.length} varieties`)
  return { updated: results.length, varieties: results }
}
