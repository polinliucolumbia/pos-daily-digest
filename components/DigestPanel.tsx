'use client'

import { useState } from 'react'

type Story = { headline: string; summary: string; source: string }
type Section = { topic: string; stories: Story[] }

const VISIBLE_COUNT = 3

function StoryItem({ story, date, topic }: { story: Story; date: string; topic: string }) {
  const [reaction, setReaction] = useState<'up' | 'down' | null>(null)

  async function handleReaction(next: 'up' | 'down') {
    const newReaction = reaction === next ? null : next
    setReaction(newReaction)
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        digest_date: date,
        topic,
        headline: story.headline,
        source: story.source,
        reaction: newReaction,
      }),
    })
  }

  return (
    <li className="flex gap-3 text-sm leading-relaxed group -mx-2 px-2 py-1.5 rounded-lg hover:bg-[#FAB348]/15 transition-colors">
      <span className="text-stone-300 shrink-0 mt-0.5">—</span>
      <div className="flex-1">
        <span className="font-medium text-stone-900">{story.headline}.</span>{' '}
        <span className="text-stone-500">{story.summary}</span>{' '}
        {story.source && (
          <span className="text-stone-300 text-xs">({story.source})</span>
        )}
        <span className="inline-flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleReaction('up')}
            className={`text-sm px-1 rounded transition-colors ${
              reaction === 'up'
                ? 'text-[#0d5c45]'
                : 'text-stone-300 hover:text-[#0d5c45]'
            }`}
            title="More like this"
          >
            ↑
          </button>
          <button
            onClick={() => handleReaction('down')}
            className={`text-sm px-1 rounded transition-colors ${
              reaction === 'down'
                ? 'text-rose-500'
                : 'text-stone-300 hover:text-rose-400'
            }`}
            title="Less like this"
          >
            ↓
          </button>
        </span>
      </div>
    </li>
  )
}

function SectionBlock({ section, date, index }: { section: Section; date: string; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const visible = section.stories.slice(0, VISIBLE_COUNT)
  const hidden = section.stories.slice(VISIBLE_COUNT)
  const hasMore = hidden.length > 0

  return (
    <div className="rounded-xl border border-stone-300 bg-white px-6 py-5">
      {/* Retro card header bar */}
      <div className="flex items-center gap-2 mb-5">
        <span className="flex gap-1 items-center">
          <span className="w-2 h-2 rounded-full border border-stone-400 inline-block" />
          <span className="w-2 h-2 rounded-full border border-stone-400 inline-block" />
          <span className="w-2 h-2 rounded-full border border-stone-400 inline-block" />
        </span>
        <span className="flex-1 border-t border-dashed border-stone-300" />
        <span className="font-mono text-xs text-stone-400">[NO. {String(index + 1).padStart(2, '0')}]</span>
      </div>

      <h2 className="font-[family-name:var(--font-serif)] text-base font-normal text-[#0d5c45] mb-4">
        {section.topic}
      </h2>
      <ul className="space-y-1">
        {visible.map((story, i) => (
          <StoryItem key={i} story={story} date={date} topic={section.topic} />
        ))}
        {expanded && hidden.map((story, i) => (
          <StoryItem key={`h-${i}`} story={story} date={date} topic={section.topic} />
        ))}
      </ul>
      {hasMore && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 text-xs text-stone-400 hover:text-[#0d5c45] transition-colors"
        >
          {expanded ? 'Show less' : `Show ${hidden.length} more`}
        </button>
      )}
    </div>
  )
}

export default function DigestPanel({ sections, date }: { sections: Section[]; date: string }) {
  const d = new Date(date + 'T00:00:00')
  const formatted = d.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })

  return (
    <div>
      <p className="font-[family-name:var(--font-serif)] italic text-stone-500 text-sm mb-8">{formatted}</p>
      <div className="space-y-4">
        {sections.map((section, i) => (
          <SectionBlock key={section.topic} section={section} date={date} index={i} />
        ))}
      </div>
    </div>
  )
}
