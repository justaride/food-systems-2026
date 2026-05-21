import type { CalloutEmbed } from '@/lib/hvitbok/embeds'

const VARIANT_STYLE: Record<CalloutEmbed['variant'], string> = {
  info: 'border-sky-200 bg-sky-50/60',
  sitat: 'border-stone-300 bg-stone-50',
  advarsel: 'border-amber-200 bg-amber-50/60',
}

export function CalloutBox({ embed }: { embed: CalloutEmbed }) {
  return (
    <div
      className={`my-4 rounded-xl border p-5 ${VARIANT_STYLE[embed.variant]}`}
    >
      <p
        className={
          embed.variant === 'sitat'
            ? 'text-sm italic leading-relaxed text-stone-700'
            : 'text-sm leading-relaxed text-stone-700'
        }
      >
        {embed.variant === 'sitat' ? `«${embed.tekst}»` : embed.tekst}
      </p>
      {embed.kilde && (
        <p className="mt-2 text-xs text-stone-500">— {embed.kilde}</p>
      )}
    </div>
  )
}
