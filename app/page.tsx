import { createClient } from '@/lib/supabase'
import Timeline from '@/components/Timeline'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createClient()
  const { data: dates } = await supabase
    .from('digests')
    .select('date')
    .order('date', { ascending: true })

  return (
    <main className="min-h-screen bg-[#f5f5f0]">
      <div className="max-w-4xl mx-auto px-8 pt-10 pb-8">
        {/* Dateline bar */}
        <div className="border-t-2 border-b border-stone-800 py-2 flex justify-between items-center">
          <span className="font-mono text-xs text-stone-600 uppercase tracking-wider">Est. 2025</span>
          <span className="font-mono text-xs text-stone-600 uppercase tracking-widest">✦ AI-Curated Brief ✦</span>
          <span className="font-mono text-xs text-stone-600 uppercase tracking-wider">Vol. I</span>
        </div>

        {/* Masthead */}
        <h1 className="font-[family-name:var(--font-display)] text-8xl text-stone-900 leading-none tracking-tight text-center py-6 uppercase">
          PO's Daily Digest
        </h1>

        {/* Bottom rule + source stamps */}
        <div className="border-t-2 border-stone-800 pt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-stone-500 uppercase mr-2 tracking-wide">Sources:</span>
          {['The Verge', 'MIT Tech Review', 'BBC', 'NYT', 'CNBC', 'YouTube'].map(s => (
            <span key={s} className="text-xs px-2 py-0.5 border border-stone-800/50 font-mono uppercase tracking-wide text-stone-700">{s}</span>
          ))}
        </div>
      </div>
      <Timeline dates={dates ?? []} />
    </main>
  )
}
