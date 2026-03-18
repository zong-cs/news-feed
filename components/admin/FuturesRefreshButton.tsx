'use client'

import { useState } from 'react'

export function FuturesRefreshButton() {
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<string>('')

  async function handleRefresh() {
    setStatus('running')
    setResult('')
    try {
      const res = await fetch('/api/futures-analysis/refresh', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setStatus('done')
        setResult(`已更新 ${data.updated} 个品种`)
      } else {
        setStatus('error')
        setResult(data.error ?? '未知错误')
      }
    } catch (err) {
      setStatus('error')
      setResult(String(err))
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-900">期货品种 AI 分析</p>
        {result && (
          <p className={`text-xs mt-0.5 ${status === 'error' ? 'text-red-600' : 'text-blue-600'}`}>
            {result}
          </p>
        )}
      </div>
      <button
        onClick={handleRefresh}
        disabled={status === 'running'}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'running' ? '分析中...' : '刷新期货分析'}
      </button>
    </div>
  )
}
