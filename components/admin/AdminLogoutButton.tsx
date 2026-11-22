'use client'

export function AdminLogoutButton() {
  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100"
    >
      退出
    </button>
  )
}
