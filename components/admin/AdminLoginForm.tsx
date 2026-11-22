'use client'

import { FormEvent, useState } from 'react'

export function AdminLoginForm() {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.get('username'),
        password: form.get('password'),
      }),
    }).catch(() => null)

    if (!response?.ok) {
      const data = await response?.json().catch(() => null)
      setError(data?.error ?? '登录失败，请稍后重试')
      setSubmitting(false)
      return
    }

    window.location.reload()
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">后台登录</h1>
        <p className="mt-1 text-sm text-gray-500">登录后可手动触发抓取和 AI 分析</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">用户名</span>
            <input
              name="username"
              autoComplete="username"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">密码</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? '登录中...' : '登录'}
          </button>
        </form>

        <a href="/" className="mt-5 block text-center text-sm text-gray-500 hover:text-gray-800">
          ← 返回首页
        </a>
      </div>
    </main>
  )
}
