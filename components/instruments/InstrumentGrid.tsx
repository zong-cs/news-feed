'use client'

import { useEffect, useState } from 'react'
import { Instrument } from '@/types'
import { InstrumentCard } from './InstrumentCard'

interface Props {
  type?: string
}

export function InstrumentGrid({ type }: Props) {
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const url = type ? `/api/instruments?type=${type}` : '/api/instruments'
      const res = await fetch(url)
      if (res.ok) setInstruments(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [type])

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
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">暂无数据，前往 <a href="/admin" className="text-blue-500 underline">Admin</a> 触发爬虫</p>
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
