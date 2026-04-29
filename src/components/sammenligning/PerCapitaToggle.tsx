'use client'

type PerCapitaToggleProps = {
  value: 'absolute' | 'per_capita'
  onChange: (v: 'absolute' | 'per_capita') => void
}

export function PerCapitaToggle({ value, onChange }: PerCapitaToggleProps) {
  return (
    <div className="inline-flex rounded border border-stone-200 text-[10px]">
      <button
        type="button"
        className={`px-2 py-0.5 ${value === 'absolute' ? 'bg-stone-700 text-white' : 'text-stone-500'}`}
        onClick={() => onChange('absolute')}
      >Absolutt</button>
      <button
        type="button"
        className={`px-2 py-0.5 ${value === 'per_capita' ? 'bg-stone-700 text-white' : 'text-stone-500'}`}
        onClick={() => onChange('per_capita')}
      >Per capita</button>
    </div>
  )
}
