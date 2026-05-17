'use client'

import { useEffect, useState } from 'react'
import { Instrument } from '@/types'
import { InstrumentCard } from './InstrumentCard'

// Commodity sector grouping
const COMMODITY_SECTORS: Record<string, string[]> = {
  '黑色金属': ['螺纹钢', '热轧卷板', '铁矿石', '焦炭', '焦煤', '硅铁', '锰硅'],
  '有色金属': ['铜', '铝', '锌', '铅', '镍', '锡', '氧化铝', '工业硅', '碳酸锂', '多晶硅'],
  '贵金属': ['黄金', '白银'],
  '能源化工': ['原油', '燃料油', '沥青', '天然气', '甲醇', '乙二醇', 'PTA', '苯乙烯', 'PVC', '橡胶', '纯碱', '烧碱', '尿素', '纸浆', '玻璃'],
  '农产品': ['豆粕', '豆油', '大豆', '玉米', '棉花', '白糖', '棕榈油', '菜粕', '菜油', '花生', '鸡蛋', '生猪', '苹果', '红枣'],
}

const SECTOR_ORDER = ['黑色金属', '有色金属', '贵金属', '能源化工', '农产品']

interface Props {
  type?: string
}

export function InstrumentGrid({ type }: Props) {
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [loading, setLoading] = useState(true)
  const [openSectors, setOpenSectors] = useState<Record<string, boolean>>({})

  async function load() {
    try {
      const url = type ? `/api/instruments?type=${type}` : '/api/instruments'
      const res = await fetch(url)
      if (res.ok) {
        const data: Instrument[] = await res.json()
        setInstruments(data)
        // Default all sectors open
        if (type === 'commodity') {
          const defaults: Record<string, boolean> = {}
          SECTOR_ORDER.forEach((s) => (defaults[s] = true))
          setOpenSectors((prev) => ({ ...defaults, ...prev }))
        }
      }
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
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

  // Commodity: grouped by sector
  if (type === 'commodity') {
    const bySymbol = Object.fromEntries(instruments.map((i) => [i.symbol, i]))

    return (
      <div className="space-y-6">
        {SECTOR_ORDER.map((sector) => {
          const symbols = COMMODITY_SECTORS[sector] ?? []
          const sectorInstruments = symbols
            .map((s) => bySymbol[s])
            .filter(Boolean)
            // Sort: has news first
            .sort((a, b) => (b._count?.articles ?? 0) - (a._count?.articles ?? 0))

          if (sectorInstruments.length === 0) return null
          const isOpen = openSectors[sector] !== false

          return (
            <div key={sector}>
              <button
                onClick={() => setOpenSectors((prev) => ({ ...prev, [sector]: !isOpen }))}
                className="w-full flex items-center gap-2 text-left mb-3 pb-2 border-b border-gray-200 group"
              >
                <span className="text-sm font-semibold text-gray-700">{sector}</span>
                <span className="text-xs text-gray-400">({sectorInstruments.length})</span>
                <span className="ml-auto text-gray-400 text-xs group-hover:text-gray-600">
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>
              {isOpen && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
                  {sectorInstruments.map((inst) => (
                    <InstrumentCard key={inst.id} instrument={inst} compact />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Crypto / Stock: flat grid
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {instruments.map((inst) => (
        <InstrumentCard key={inst.id} instrument={inst} />
      ))}
    </div>
  )
}
