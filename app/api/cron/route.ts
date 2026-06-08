import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { fetchArticles } from '@/lib/rss'
import { fetchYouTubeVideos } from '@/lib/youtube'
import { summarizeArticles, summarizeYouTube } from '@/lib/summarize'
import type { Section } from '@/lib/types'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date())
  const supabase = createClient()

  // Skip if digest already exists for today
  const { data: existing } = await supabase
    .from('digests')
    .select('id')
    .eq('date', today)
    .single()

  if (existing) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'digest already exists' })
  }

  // Fetch articles from all RSS feeds
  const { articles: allArticles, feedStatus } = await fetchArticles()
  if (allArticles.length === 0) {
    return NextResponse.json({ error: 'no articles fetched from feeds', feedStatus }, { status: 500 })
  }

  // Filter out already-seen articles
  const { data: seenRows } = await supabase
    .from('seen_articles')
    .select('guid')
    .in('guid', allArticles.map(a => a.guid))

  const seenGuids = new Set(seenRows?.map(r => r.guid) ?? [])
  const newArticles = allArticles.filter(a => !seenGuids.has(a.guid))

  if (newArticles.length === 0) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'all articles already seen' })
  }

  // Get user feedback signal to inform ranking
  const { data: feedbackRows } = await supabase
    .from('story_feedback')
    .select('source, reaction, topic')

  const upvoted = [...new Set(feedbackRows?.filter(f => f.reaction === 'up').map(f => f.topic).filter(Boolean) ?? [])]
  const downvoted = [...new Set(feedbackRows?.filter(f => f.reaction === 'down').map(f => f.topic).filter(Boolean) ?? [])]

  // Summarize and categorize with Claude
  const sections: Section[] = await summarizeArticles(newArticles, { upvoted, downvoted })

  // Fetch YouTube videos and append as a dedicated section
  const { videos, feedStatus: ytFeedStatus } = await fetchYouTubeVideos()
  if (videos.length > 0) {
    const ytSection = await summarizeYouTube(videos)
    sections.push(ytSection)
  } else {
    // Always include the section so the UI can show "Nothing new!"
    sections.push({ topic: 'YouTube AI Lessons & Tips', type: 'youtube', stories: [] })
  }

  // Write digest to Supabase
  const { error } = await supabase
    .from('digests')
    .upsert({ date: today, sections }, { onConflict: 'date' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Mark all fetched articles as seen (including already-seen ones -- refreshes last_seen)
  await supabase
    .from('seen_articles')
    .upsert(
      allArticles.map(a => ({ guid: a.guid, source: a.source, last_seen: today })),
      { onConflict: 'guid' }
    )

  return NextResponse.json({
    ok: true,
    articlesProcessed: newArticles.length,
    sectionsGenerated: sections.length,
    feedStatus: [...feedStatus, ...ytFeedStatus],
  })
}
