import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import type { RawArticle } from './rss'
import type { RawVideo } from './youtube'
import type { Section } from './types'

const DigestSchema = z.object({
  sections: z.array(z.object({
    topic: z.string(),
    stories: z.array(z.object({
      headline: z.string(),
      summary: z.string(),
      source: z.string(),
    })),
  })),
})

export async function summarizeArticles(
  articles: RawArticle[],
  feedback: { upvoted: string[]; downvoted: string[] }
): Promise<z.infer<typeof DigestSchema>['sections']> {

  const articleList = articles
    .map((a, i) => `[${i + 1}] Topic hint: ${a.topic} | Source: ${a.source}\nTitle: ${a.title}\nDescription: ${a.description}`)
    .join('\n\n')

  const feedbackNote = feedback.upvoted.length || feedback.downvoted.length
    ? `\nUser preferences based on past reactions:\n- Show more stories about these topics: ${feedback.upvoted.join(', ')}\n- Show fewer stories about these topics: ${feedback.downvoted.join(', ')}`
    : ''

  const { object } = await generateObject({
    model: anthropic('claude-haiku-4-5-20251001'),
    schema: DigestSchema,
    prompt: `Build a concise daily news digest readable in 5–10 minutes by categorizing and summarizing these articles.

Use exactly these topic names (omit any section with no relevant content):
- AI & Tech: AI, software, startups, tech companies, products
- Business: economy, markets, companies, strategy, retail
- Global News: international news, geopolitics, world events, foreign policy
- Austria & Taiwan: any story that directly concerns Austria or Taiwan, regardless of subject
- Sports: major championships, tournament finals, Olympics results, record-breaking performances — SKIP routine game scores, injury reports, trade rumors, and regular-season standings
- Culture & Entertainment: wide-release films at or near opening weekend, major award show results (Oscars, Grammys, Emmys), or cultural phenomena everyone is discussing — SKIP casting announcements, industry deals, and production updates

Rules:
- Only include a section if it has relevant articles
- Maximum 4 stories per section; pick only the most important/novel ones
- Rank stories within each section by: (1) major policy, regulatory, or geopolitical decisions; (2) significant market moves or company strategy; (3) scientific or technological breakthroughs; (4) general interest — skip press releases, incremental product updates, and opinion pieces
- For Austria & Taiwan: prepend "🇦🇹 " to Austrian headlines, "🇹🇼 " to Taiwan headlines; do NOT place these stories in Global News
- Headlines: clear, concise, rewritten statements (not clickbait)
- Summaries: exactly one sentence, factual
- Use the "Topic hint" as guidance but reclassify if a better topic fits — articles with hint 'General' may be placed in any section; EXCEPTION: articles with topic hint 'Austria & Taiwan' must ALWAYS be placed in the Austria & Taiwan section and never moved to any other section
- For ORF articles (source: "ORF"): only include if the story directly concerns Austrian domestic affairs (politics, society, economy within Austria); skip ORF articles about foreign events with no specific Austrian domestic angle
- For articles in non-English languages (e.g. German from ORF): write the headline and summary in English
- If multiple articles cover the same event, merge them into one story using the best-sourced version; never include the same event twice
${feedbackNote}

Articles to process:
${articleList}`,
  })

  return object.sections
}

const YouTubeSectionSchema = z.object({
  videos: z.array(z.object({
    videoId: z.string(),
    title: z.string(),
    channelName: z.string(),
    takeaway: z.string(),
  })),
})

export async function summarizeYouTube(videos: RawVideo[]): Promise<Section> {
  const videoList = videos
    .map((v, i) => `[${i + 1}] VideoId: ${v.videoId}\nChannel: ${v.channelName}\nTitle: ${v.title}\nDescription: ${v.description}`)
    .join('\n\n')

  const { object } = await generateObject({
    model: anthropic('claude-haiku-4-5-20251001'),
    schema: YouTubeSectionSchema,
    prompt: `You are curating an "AI Lessons & Tips" section for a daily digest.

For each YouTube video below, write a 1–2 sentence takeaway: the specific lesson, insight, or technique a viewer would learn. Be concrete and specific — avoid generic summaries like "this video explains AI concepts."

Rules:
- Skip videos where the title and description don't contain enough content to write a meaningful takeaway (e.g. pure Q&A, live streams with no description)
- Return at most 5 videos
- Keep the videoId and channelName exactly as given

Videos:
${videoList}`,
  })

  return {
    topic: 'YouTube AI Lessons & Tips',
    type: 'youtube',
    stories: object.videos.map(v => ({
      headline: v.title,
      summary: v.takeaway,
      source: v.channelName,
      url: `https://www.youtube.com/watch?v=${v.videoId}`,
      videoId: v.videoId,
    })),
  }
}
