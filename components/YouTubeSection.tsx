import Image from 'next/image'
import type { Section } from '@/lib/types'

export default function YouTubeSection({ section, index }: { section: Section; index: number }) {
  return (
    <div className="rounded-xl border border-stone-800/20 border-t-2 border-t-red-600 bg-white px-6 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 flex items-center justify-center bg-red-600 text-white text-base rounded-md shrink-0">
            ▶
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-xl text-stone-900 font-normal">
            {section.topic}
          </h2>
        </div>
        <span className="font-mono text-xs text-stone-400 border border-stone-200 px-1.5 py-0.5 rounded shrink-0">
          NO. {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Separator */}
      <div className="flex items-center gap-2 mb-4">
        <span className="flex gap-1 items-center">
          <span className="w-2 h-2 rounded-full border border-stone-400 inline-block" />
          <span className="w-2 h-2 rounded-full border border-stone-400 inline-block" />
          <span className="w-2 h-2 rounded-full border border-stone-400 inline-block" />
        </span>
        <span className="flex-1 border-t border-dashed border-stone-300" />
      </div>

      {section.stories.length === 0 ? (
        <p className="text-sm text-stone-400 italic">Nothing new! Check back later.</p>
      ) : (
        <div className="space-y-3">
          {section.stories.map((video, i) => (
            <a
              key={i}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 -mx-2 px-2 py-2 rounded-lg hover:bg-red-50 transition-colors group"
            >
              {video.videoId && (
                <div className="shrink-0 rounded overflow-hidden w-24 h-[54px] relative bg-stone-100">
                  <Image
                    src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized={false}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-900 text-sm leading-snug line-clamp-2 group-hover:text-red-700 transition-colors">
                  {video.headline}
                </p>
                <p className="text-stone-500 text-xs mt-0.5 line-clamp-2">{video.summary}</p>
                <p className="text-stone-300 text-xs mt-1">{video.source}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
