import { cookies } from 'next/headers'
import { ScrapePanel } from '@/components/admin/ScrapePanel'
import { FuturesRefreshButton } from '@/components/admin/FuturesRefreshButton'
import { TechnicalRefreshButton } from '@/components/admin/TechnicalRefreshButton'
import { AdminLoginForm } from '@/components/admin/AdminLoginForm'
import { AdminLogoutButton } from '@/components/admin/AdminLogoutButton'
import { ADMIN_COOKIE_NAME, isValidAdminSession } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const authenticated = isValidAdminSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value)

  if (!authenticated) return <AdminLoginForm />

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
            <p className="text-sm text-gray-500 mt-1">手动触发新闻爬取</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              ← 首页
            </a>
            <AdminLogoutButton />
          </div>
        </div>

        <div className="mb-4">
          <FuturesRefreshButton />
        </div>
        <div className="mb-6">
          <TechnicalRefreshButton />
        </div>

        <ScrapePanel />
      </div>
    </main>
  )
}
