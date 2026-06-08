export type RawArticle = {
  guid: string
  title: string
  description: string
  source: string
  topic: string
}

export type FeedStatus = {
  source: string
  ok: boolean
  status?: number
  count?: number
  error?: string
}

type FeedConfig = {
  url: string
  source: string
  topic: string
}

const FEEDS: FeedConfig[] = [
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge', topic: 'AI & Tech' },
  { url: 'https://www.technologyreview.com/feed/', source: 'MIT Technology Review', topic: 'AI & Tech' },
  { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World', topic: 'Global News' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYT World', topic: 'Global News' },
  { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147', source: 'CNBC Business', topic: 'Business & Ops' },
  { url: 'https://www.taipeitimes.com/xml/index.rss', source: 'Taipei Times', topic: 'Austria & Taiwan' },
  { url: 'https://rss.orf.at/news.xml', source: 'ORF', topic: 'Austria & Taiwan' },
]

function extractTag(item: string, tag: string): string {
  const cdata = item.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))
  if (cdata) return cdata[1].trim()
  const plain = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  if (!plain) return ''
  return plain[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

export function isRecent(pubDate: string, hours = 24): boolean {
  if (!pubDate) return true
  const d = new Date(pubDate)
  if (isNaN(d.getTime())) return true
  return Date.now() - d.getTime() < hours * 60 * 60 * 1000
}

export function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

export async function fetchArticles(): Promise<{ articles: RawArticle[]; feedStatus: FeedStatus[] }> {
  const articles: RawArticle[] = []
  const feedStatus: FeedStatus[] = []

  await Promise.allSettled(
    FEEDS.map(async (feed) => {
      try {
        const res = await fetch(feed.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DigestBot/1.0)' },
          cache: 'no-store',
        })

        if (!res.ok) {
          feedStatus.push({ source: feed.source, ok: false, status: res.status, error: `HTTP ${res.status}` })
          return
        }

        const xml = await res.text()
        const items = xml.split('<item').slice(1)
        let count = 0

        for (const item of items) {
          const pubDate = extractTag(item, 'pubDate')
          if (!isRecent(pubDate)) continue

          const guid = extractTag(item, 'guid') || extractTag(item, 'link')
          const title = extractTag(item, 'title')
          const description = stripHtml(extractTag(item, 'description')).substring(0, 400)

          if (!title || !guid) continue

          articles.push({ guid, title, description, source: feed.source, topic: feed.topic })
          count++
        }

        feedStatus.push({ source: feed.source, ok: true, count })
      } catch (e) {
        feedStatus.push({ source: feed.source, ok: false, error: String(e) })
      }
    })
  )

  return { articles, feedStatus }
}
