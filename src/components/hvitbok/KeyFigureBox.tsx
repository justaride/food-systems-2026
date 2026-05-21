import type { NokkeltallEmbed } from '@/lib/hvitbok/embeds'

export function KeyFigureBox({ embed }: { embed: NokkeltallEmbed }) {
  return (
    <div className="my-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
      <p className="text-[10px] uppercase tracking-wider text-emerald-700">
        {embed.label}
      </p>
      <p className="mt-1 text-3xl font-bold text-stone-900">
        {embed.value}
        {embed.enhet && (
          <span className="ml-1 text-lg font-semibold text-stone-500">
            {embed.enhet}
          </span>
        )}
      </p>
      <p className="mt-2 text-xs text-stone-500">Kilde: {embed.kilde}</p>
    </div>
  )
}
