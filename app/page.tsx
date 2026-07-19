import { prisma } from '@/lib/db'
import { HomePage } from '@/components/HomePage'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let serialized: any[] = []

  try {
    const analyses = await prisma.futuresVarietyAnalysis.findMany({
      orderBy: { updatedAt: 'desc' },
    })
    serialized = analyses.map((a) => ({
      ...a,
      updatedAt: a.updatedAt.toISOString(),
      technicalUpdatedAt: a.technicalUpdatedAt?.toISOString() ?? null,
      sources: a.sources ?? '[]',
    }))
  } catch (err) {
    console.error('[page] db error, rendering empty:', err)
  }

  return <HomePage initialAnalyses={serialized} />
}
