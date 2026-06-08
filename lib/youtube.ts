import { isRecent, stripHtml, FeedStatus } from './rss'

export type RawVideo = {
  videoId: string
  title: string
  description: string
  channelName: string
  publishedAt: string
}

type ChannelConfig = {
  channelId: string
  name: string
}

const YOUTUBE_CHANNELS: ChannelConfig[] = [
  { channelId: 'UC2ojq-nuP8ceeHqiroeKhBA', name: 'Nate Herk' },
  { channelId: 'UC2UXDak6o7rBm23k3Vv5dww', name: 'Tina Huang' },
]

function extractTag(xml: string, tag: string): string {
  const cdata = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))
  if (cdata) return cdata[1].trim()
  const plain = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  if (!plain) return ''
  return plain[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

export async function fetchYouTubeVideos(): Promise<{ videos: RawVideo[]; feedStatus: FeedStatus[] }> {
  const videos: RawVideo[] = []
  const feedStatus: FeedStatus[] = []

  await Promise.allSettled(
    YOUTUBE_CHANNELS.map(async (channel) => {
      try {
        const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DigestBot/1.0)' },
          cache: 'no-store',
        })

        if (!res.ok) {
          feedStatus.push({ source: channel.name, ok: false, status: res.status, error: `HTTP ${res.status}` })
          return
        }

        const xml = await res.text()
        const entries = xml.split('<entry>').slice(1)
        let count = 0

        for (const entry of entries) {
          const publishedAt = extractTag(entry, 'published')
          // 7-day window — captures the whole week's uploads, not just today
          if (!isRecent(publishedAt, 168)) continue

          const videoId = extractTag(entry, 'yt:videoId')
          const title = extractTag(entry, 'title')
          const description = stripHtml(extractTag(entry, 'media:description')).substring(0, 500)

          if (!videoId || !title) continue

          videos.push({ videoId, title, description, channelName: channel.name, publishedAt })
          count++
        }

        feedStatus.push({ source: channel.name, ok: true, count })
      } catch (e) {
        feedStatus.push({ source: channel.name, ok: false, error: String(e) })
      }
    })
  )

  return { videos, feedStatus }
}
