import Link from 'next/link'
import { Instrument } from '@/types'

const typeBg: Record<string, string> = {
  stock: 'border-blue-200 bg-blue-50 hover:border-blue-300',
  crypto: 'border-orange-200 bg-orange-50 hover:border-orange-300',
  commodity: 'border-yellow-200 bg-yellow-50 hover:border-yellow-300',
  forex: 'border-purple-200 bg-purple-50 hover:border-purple-300',
}

interface Props {
  instrument: Instrument
  compact?: boolean
}

export function InstrumentCard({ instrument, compact = false }: Props) {
  const count = instrument._count?.articles ?? 0
  const bg = typeBg[instrument.type] ?? 'border-gray-200 bg-gray-50 hover:border-gray-300'

  if (compact) {
    return (
      <Link href={`/instruments/${encodeURIComponent(instrument.symbol)}`}>
        <div className={`rounded-lg border p-3 hover:shadow-sm transition-all cursor-pointer ${bg}`}>
          <p className="text-sm font-bold text-gray-900 truncate">{instrument.symbol}</p>
          <p className="text-xs text-gray-400 mt-1">
            {count > 0 ? (
              <span className="text-gray-600">{count} 条</span>
            ) : (
              <span>暂无新闻</span>
            )}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/instruments/${encodeURIComponent(instrument.symbol)}`}>
      <div className={`rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer ${bg}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-lg font-bold text-gray-900 truncate">{instrument.symbol}</p>
            <p className="text-sm text-gray-600 mt-0.5 truncate">{instrument.name}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <span>{count} 条新闻</span>
          {instrument.exchange && (
            <span className="text-gray-400 text-xs">· {instrument.exchange}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
