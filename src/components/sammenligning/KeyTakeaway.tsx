type KeyTakeawayProps = { headline: string; subline?: string }

export function KeyTakeaway({ headline, subline }: KeyTakeawayProps) {
  return (
    <div className="border-l-4 border-emerald-500 bg-emerald-50/40 px-4 py-3 my-4 rounded-r">
      <p className="text-base font-semibold text-stone-800">{headline}</p>
      {subline && <p className="text-xs text-stone-500 mt-0.5">{subline}</p>}
    </div>
  )
}
