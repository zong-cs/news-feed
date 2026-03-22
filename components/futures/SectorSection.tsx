'use client'

import { useState } from 'react'
import { VarietyAnalysisCard } from './VarietyAnalysisCard'

interface Analysis {
  id: string
  variety: string
  sector: string | null
  contradiction: string
  opportunity: string
  bullCase: string
  bearCase: string
  sentiment: string
  updatedAt: string
}

export function SectorSection({ sector, analyses }: { sector: string; analyses: Analysis[] }) {
  const [open, setOpen] = useState(true)

  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 text-left mb-4 pb-2 border-b border-gray-200 group"
      >
        <span className="text-base font-semibold text-gray-800">{sector}</span>
        <span className="text-sm font-normal text-gray-400">({analyses.length})</span>
        <span className="ml-auto text-gray-400 text-sm group-hover:text-gray-600">
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {analyses.map((a) => (
            <VarietyAnalysisCard key={a.id} analysis={a} />
          ))}
        </div>
      )}
    </section>
  )
}
