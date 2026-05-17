'use client'

import { useState } from 'react'

export function TechnicalRefreshButton() {
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<string>('')

  async function handleRefresh() {
    setStatus('running')
    setResult('')
    try {
      const res = await fetch('/api/futures-analysis/technical', { method: 'POST' })
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
    <div className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-purple-900">期货技术分析</p>
        <p className="text-xs text-purple-500 mt-0.5">抓取同花顺日线/周线K线，AI分析支撑阻力、入场点、盈亏比</p>
        {result && (
          <p className={`text-xs mt-1 ${status === 'error' ? 'text-red-600' : 'text-purple-600'}`}>
            {result}
          </p>
        )}
      </div>
      <button
        onClick={handleRefresh}
        disabled={status === 'running'}
        className="rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
      >
        {status === 'running' ? '分析中...' : '刷新技术分析'}
      </button>
    </div>
  )
}
