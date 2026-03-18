import { InstrumentGrid } from '@/components/instruments/InstrumentGrid'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">财经新闻聚合</h1>
            <p className="text-sm text-gray-500 mt-1">按交易标的聚合 · 每60秒自动刷新</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/futures-analysis"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              期货分析
            </a>
            <a
              href="/admin"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Admin
            </a>
          </div>
        </div>
        <InstrumentGrid />
      </div>
    </main>
  )
}
