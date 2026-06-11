import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import type { Section, Story } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { date, topic, headlines } = await req.json()

  if (!date || !topic || !Array.isArray(headlines)) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('digests')
    .select('sections')
    .eq('date', date)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  const sections: Section[] = data.sections
  const section = sections.find(s => s.topic === topic)
  if (!section) {
    return NextResponse.json({ error: 'section not found' }, { status: 404 })
  }

  // Stories missing from the headline list keep their current order at the end
  const position = (s: Story) => {
    const i = headlines.indexOf(s.headline)
    return i === -1 ? headlines.length : i
  }
  section.stories = [...section.stories].sort((a, b) => position(a) - position(b))

  const { error: updateError } = await supabase
    .from('digests')
    .update({ sections })
    .eq('date', date)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
