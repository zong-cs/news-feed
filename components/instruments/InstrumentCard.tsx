import Link from 'next/link'
import { Instrument } from '@/types'

const typeLabel: Record<string, string> = {
  stock: '股票',
  crypto: '加密',
  commodity: '大宗',
  forex: '外汇',
}

const typeBg: Record<string, string> = {
  stock: 'border-blue-200 bg-blue-50',
  crypto: 'border-orange-200 bg-orange-50',
  commodity: 'border-yellow-200 bg-yellow-50',
  forex: 'border-purple-200 bg-purple-50',
}

export function InstrumentCard({ instrument }: { instrument: Instrument }) {
  const count = instrument._count?.articles ?? 0
  const bg = typeBg[instrument.type] ?? 'border-gray-200 bg-gray-50'

  return (
    <Link href={`/instruments/${encodeURIComponent(instrument.symbol)}`}>
      <div
        className={`rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer ${bg}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-lg font-bold text-gray-900">{instrument.symbol}</p>
            <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{instrument.name}</p>
          </div>
          <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-gray-600 border">
            {typeLabel[instrument.type] ?? instrument.type}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <span>{count} 条新闻</span>
          {instrument.exchange && (
            <span className="text-gray-400">· {instrument.exchange}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
