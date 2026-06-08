'use client'

import { useState } from 'react'
import PixelClouds from './PixelClouds'
import YouTubeSection from './YouTubeSection'
import type { Story, Section } from '@/lib/types'

const VISIBLE_COUNT = 3

const TOPIC_ICONS: Record<string, string> = {
  technology: '⚡', tech: '⚡',
  business: '◈', finance: '◈', economy: '◈',
  politics: '⬡', world: '⬡', government: '⬡',
  science: '◎', health: '◎', medicine: '◎',
  culture: '✺', entertainment: '✺', arts: '✺',
  sports: '◉',
  climate: '◌', environment: '◌',
  default: '◆',
}

function getIcon(topic: string) {
  const key = topic.toLowerCase().split(/[\s/]/)[0]
  return TOPIC_ICONS[key] ?? TOPIC_ICONS.default
}

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
    <div className="rounded-xl border border-stone-800/20 border-t-2 border-t-[#0d5c45] bg-white px-6 py-5">
      {/* Icon + title header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 flex items-center justify-center bg-[#0d5c45] text-white text-lg rounded-md shrink-0">
            {getIcon(section.topic)}
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-xl text-stone-900 font-normal">
            {section.topic}
          </h2>
        </div>
        <span className="font-mono text-xs text-stone-400 border border-stone-200 px-1.5 py-0.5 rounded shrink-0">
          NO. {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      {/* Three-dot + dashed separator */}
      <div className="flex items-center gap-2 mb-4">
        <span className="flex gap-1 items-center">
          <span className="w-2 h-2 rounded-full border border-stone-400 inline-block" />
          <span className="w-2 h-2 rounded-full border border-stone-400 inline-block" />
          <span className="w-2 h-2 rounded-full border border-stone-400 inline-block" />
        </span>
        <span className="flex-1 border-t border-dashed border-stone-300" />
      </div>

      {/* Original retro card header bar — commented out for easy revert */}
      {/*
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
      */}

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
  }).toUpperCase()

  return (
    <div>
      <div className="mb-8">
        <span className="font-mono text-xs text-stone-500 border border-stone-300 px-2 py-1 uppercase tracking-widest">
          {formatted}
        </span>
      </div>
      <div className="relative">
        <PixelClouds />
        <div className="relative z-10 space-y-4">
          {sections.map((section, i) =>
            section.type === 'youtube' ? (
              <YouTubeSection key={section.topic} section={section} index={i} />
            ) : (
              <SectionBlock key={section.topic} section={section} date={date} index={i} />
            )
          )}
        </div>
      </div>
    </div>
  )
}
