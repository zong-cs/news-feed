'use client'

import { useEffect, useState } from 'react'
import { Instrument } from '@/types'
import { InstrumentCard } from './InstrumentCard'

export function InstrumentGrid() {
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const res = await fetch('/api/instruments')
      if (res.ok) setInstruments(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (instruments.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">暂无标的数据</p>
        <p className="text-sm mt-1">
          前往{' '}
          <a href="/admin" className="text-blue-500 underline">
            Admin
          </a>{' '}
          触发爬虫
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {instruments.map((inst) => (
        <InstrumentCard key={inst.id} instrument={inst} />
      ))}
    </div>
  )
}
