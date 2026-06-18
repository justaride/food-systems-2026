import type { EffectLevel } from '@/lib/data/circular-leverage'

type Dimension = 'klima' | 'natur' | 'forurensning' | 'resiliens' | 'distrikt' | 'helse'

const DIMENSION_LABEL: Record<Dimension, string> = {
  klima: 'Klima',
  natur: 'Natur',
  forurensning: 'Forurensning',
  resiliens: 'Resiliens',
  distrikt: 'Distrikt',
  helse: 'Helse',
}

const DIMENSION_COLOR: Record<Dimension, string> = {
  klima: 'bg-red-600',
  natur: 'bg-green-600',
  forurensning: 'bg-blue-500',
  resiliens: 'bg-amber-600',
  distrikt: 'bg-purple-600',
  helse: 'bg-pink-600',
}

const LEVEL_WIDTH: Record<EffectLevel, string> = {
  high: 'w-[90%]',
  medium: 'w-[60%]',
  low: 'w-[30%]',
}

const LEVEL_LABEL: Record<EffectLevel, string> = {
  high: 'høy',
  medium: 'medium',
  low: 'lav',
}

type Props = {
  dim: Dimension
  level: EffectLevel
}

export function EffectBar({ dim, level }: Props) {
  return (
    <div
      className="flex flex-col items-end gap-[2px]"
      aria-label={`${DIMENSION_LABEL[dim]}-effekt: ${LEVEL_LABEL[level]}`}
    >
      <div className="text-[10px] uppercase tracking-wide text-stone-400">{DIMENSION_LABEL[dim]}</div>
      <div className="w-16 h-[5px] bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full ${LEVEL_WIDTH[level]} ${DIMENSION_COLOR[dim]}`} />
      </div>
    </div>
  )
}
