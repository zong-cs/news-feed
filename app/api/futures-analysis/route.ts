import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const analyses = await prisma.futuresVarietyAnalysis.findMany({
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(analyses)
}
