type InternalBannerProps = {
  note?: string
}

const DEFAULT_NOTE =
  'Datakvalitet, kurasjon og kildekontroll — internt arbeidsgrunnlag, ikke ferdig formidling. Tall og status kan endres.'

export function InternalBanner({ note }: InternalBannerProps) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">🛠 Intern arbeidsflate</p>
      <p className="mt-1 text-xs leading-relaxed text-amber-950">{note ?? DEFAULT_NOTE}</p>
    </div>
  )
}
