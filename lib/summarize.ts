import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import type { RawArticle } from './rss'

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

Use exactly these topic names:
- AI & Tech: AI, software, startups, tech companies, products
- Business & Ops: economy, markets, companies, strategy, retail
- Health & Wellness: health, medicine, fitness, mental health
- Global News: international news, geopolitics, world events, foreign policy
- Austria & Taiwan: any story that directly concerns Austria or Taiwan, regardless of subject

Rules:
- Only include a section if it has relevant articles
- Maximum 4 stories per section; pick only the most important/novel ones
- Rank stories within each section by: (1) major policy, regulatory, or geopolitical decisions; (2) significant market moves or company strategy; (3) scientific or technological breakthroughs; (4) general interest — skip press releases, incremental product updates, and opinion pieces
- For Austria & Taiwan: prepend "🇦🇹 " to Austrian headlines, "🇹🇼 " to Taiwan headlines; do NOT place these stories in Global News
- Headlines: clear, concise, rewritten statements (not clickbait)
- Summaries: exactly one sentence, factual
- Use the "Topic hint" as guidance but reclassify if a better topic fits
- If multiple articles cover the same event, merge them into one story using the best-sourced version; never include the same event twice
${feedbackNote}

Articles to process:
${articleList}`,
  })

  return object.sections
}
