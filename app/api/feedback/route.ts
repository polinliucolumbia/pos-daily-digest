import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { digest_date, topic, headline, source, reaction } = await req.json()

  if (!digest_date || !headline || !reaction) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  }

  const supabase = createClient()

  if (reaction === null) {
    // Toggle off -- remove feedback
    await supabase
      .from('story_feedback')
      .delete()
      .eq('digest_date', digest_date)
      .eq('headline', headline)
      .eq('source', source ?? '')
    return NextResponse.json({ ok: true })
  }

  const { error } = await supabase
    .from('story_feedback')
    .upsert({ digest_date, topic, headline, source: source ?? '', reaction },
      { onConflict: 'digest_date,headline,source' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
