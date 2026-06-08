'use client'

import { useState, useEffect } from 'react'
import DigestPanel from './DigestPanel'
import type { Section } from '@/lib/types'

type DigestDate = { date: string }

export default function Timeline({ dates }: { dates: DigestDate[] }) {
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [sections, setSections] = useState<Section[] | null>(null)
  const [loading, setLoading] = useState(false)

  // Auto-select today (or most recent) on mount
  useEffect(() => {
    const target = dates.find(d => d.date === today) ?? dates[dates.length - 1]
    if (target) selectDate(target.date)
  }, [])

  async function selectDate(date: string) {
    setSelectedDate(date)
    setLoading(true)
    setSections(null)
    const res = await fetch(`/api/digest?date=${date}`)
    const data = await res.json()
    setSections(data.sections ?? null)
    setLoading(false)
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (dates.length === 0) {
    return <p className="text-stone-400 text-sm px-8">No digests yet.</p>
  }

  return (
    <div>
      {/* Timeline — full screen width */}
      <div className="w-full overflow-x-auto">
        <div className="flex items-start gap-10 relative py-2 px-8 min-w-max">
          {/* Connecting line spanning full width */}
          <div className="absolute top-4 left-8 right-8 h-px bg-stone-300" />

          {dates.map((d) => {
            const isToday = d.date === today
            const isSelected = d.date === selectedDate
            return (
              <button
                key={d.date}
                onClick={() => selectDate(d.date)}
                className="flex flex-col items-center gap-2 relative group"
              >
                <div className={`rounded-full border-2 transition-all duration-150 group-hover:scale-110 ${
                  isSelected
                    ? 'w-4 h-4 bg-[#0d5c45] border-[#0d5c45] ring-2 ring-[#0d5c45]/20 ring-offset-2'
                    : isToday
                    ? 'w-3 h-3 bg-[#0d5c45]/10 border-[#0d5c45]/40 group-hover:border-[#0d5c45]'
                    : 'w-3 h-3 bg-stone-50 border-stone-300 group-hover:border-stone-500'
                }`} />
                <span className={`text-xs whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'text-[#0d5c45] font-medium'
                    : isToday
                    ? 'text-[#0d5c45]/60'
                    : 'text-stone-400'
                }`}>
                  {formatDate(d.date)}{isToday ? ' ★' : ''}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Digest content — centered, wider */}
      <div className="max-w-4xl mx-auto px-8 mt-10 pb-14">
        {loading && (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border border-stone-800/20 border-t-2 border-t-[#0d5c45] bg-white px-6 py-5">
                {/* Skeleton icon + title header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-md bg-stone-100 shrink-0" />
                    <span className="h-4 w-28 bg-stone-100 rounded" />
                  </div>
                  <span className="h-5 w-12 bg-stone-100 rounded" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 rounded-full border border-stone-200 inline-block" />
                    <span className="w-2 h-2 rounded-full border border-stone-200 inline-block" />
                    <span className="w-2 h-2 rounded-full border border-stone-200 inline-block" />
                  </span>
                  <span className="flex-1 border-t border-dashed border-stone-200" />
                </div>
                <div className="space-y-3">
                  <div className="h-3.5 bg-stone-100 rounded w-4/5" />
                  <div className="h-3.5 bg-stone-100 rounded w-full" />
                  <div className="h-3.5 bg-stone-100 rounded w-3/5" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && sections && selectedDate && (
          <DigestPanel sections={sections} date={selectedDate} />
        )}
      </div>
    </div>
  )
}
