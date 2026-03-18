import { ScrapePanel } from '@/components/admin/ScrapePanel'
import { FuturesRefreshButton } from '@/components/admin/FuturesRefreshButton'

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
            <p className="text-sm text-gray-500 mt-1">手动触发新闻爬取</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/futures-analysis"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              期货分析
            </a>
            <a
              href="/"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              ← 首页
            </a>
          </div>
        </div>

        <div className="mb-6">
          <FuturesRefreshButton />
        </div>

        <ScrapePanel />
      </div>
    </main>
  )
}
