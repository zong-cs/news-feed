'use client'

import { useState, useEffect } from 'react'
import { ALL_SOURCES } from '@/lib/scraper/sources'
import { ScrapeJobStatus } from '@/types'

export function ScrapePanel() {
  const [jobs, setJobs] = useState<Record<string, ScrapeJobStatus>>({})
  const [running, setRunning] = useState<Record<string, boolean>>({})

  async function loadJobs() {
    const res = await fetch('/api/news?limit=1')
    // We don't have a jobs endpoint yet — use local state only
  }

  async function triggerScrape(source: string) {
    setRunning((r) => ({ ...r, [source]: true }))
    setJobs((j) => ({
      ...j,
      [source]: { ...j[source], id: 0, source, status: 'running', lastRun: null, count: 0, error: null },
    }))

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      })
      const data = await res.json()

      if (res.ok) {
        setJobs((j) => ({
          ...j,
          [source]: {
            ...j[source],
            status: 'done',
            count: data.count,
            lastRun: new Date().toISOString(),
            error: null,
          },
        }))
      } else {
        setJobs((j) => ({
          ...j,
          [source]: { ...j[source], status: 'error', error: data.error },
        }))
      }
    } catch (err) {
      setJobs((j) => ({
        ...j,
        [source]: { ...j[source], status: 'error', error: String(err) },
      }))
    } finally {
      setRunning((r) => ({ ...r, [source]: false }))
    }
  }

  return (
    <div className="space-y-3">
      {ALL_SOURCES.map((source) => {
        const job = jobs[source]
        const isRunning = running[source]

        return (
          <div
            key={source}
            className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-medium w-28">{source}</span>
              {job && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    job.status === 'done'
                      ? 'bg-green-100 text-green-700'
                      : job.status === 'error'
                      ? 'bg-red-100 text-red-700'
                      : job.status === 'running'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {job.status === 'done' ? `✓ ${job.count} 条` : job.status}
                </span>
              )}
              {job?.error && (
                <span className="text-xs text-red-500 truncate max-w-xs">{job.error}</span>
              )}
            </div>

            <button
              onClick={() => triggerScrape(source)}
              disabled={isRunning}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? '抓取中...' : '抓取'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
