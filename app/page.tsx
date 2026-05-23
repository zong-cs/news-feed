import { prisma } from '@/lib/db'
import { HomePage } from '@/components/HomePage'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const analyses = await prisma.futuresVarietyAnalysis.findMany({
    orderBy: { updatedAt: 'desc' },
  })

  const serialized = analyses.map((a) => ({
    ...a,
    updatedAt: a.updatedAt.toISOString(),
    technicalUpdatedAt: a.technicalUpdatedAt?.toISOString() ?? null,
    sources: a.sources ?? '[]',
  }))

  return <HomePage initialAnalyses={serialized} />
}
