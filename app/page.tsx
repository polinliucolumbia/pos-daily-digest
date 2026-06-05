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
      <div className="max-w-4xl mx-auto px-8 pt-14 pb-10">
        <h1 className="font-[family-name:var(--font-serif)] text-5xl font-normal text-stone-900 leading-tight">Daily Digest</h1>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {['The Verge', 'MIT Tech Review', 'BBC', 'NYT', 'CNBC'].map(s => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-[#0d5c45]/10 text-[#0d5c45] border border-[#0d5c45]/20 font-medium">{s}</span>
          ))}
        </div>
      </div>
      <Timeline dates={dates ?? []} />
    </main>
  )
}
