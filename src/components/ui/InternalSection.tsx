import type { ReactNode } from 'react'

type InternalSectionProps = {
  label: string
  summary?: string
  children: ReactNode
}

const DEFAULT_SUMMARY = 'Internt arbeidsgrunnlag — ikke ferdig formidling. Tall kan endres.'

export function InternalSection({ label, summary = DEFAULT_SUMMARY, children }: InternalSectionProps) {
  return (
    <details className="group rounded-lg border border-stone-200 bg-stone-50/80">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-700 [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true">🛠</span>
        <span>Internt: {label}</span>
        <span className="font-normal text-xs text-stone-500">{summary}</span>
        <span className="ml-auto text-xs text-stone-400">
          <span className="group-open:hidden">vis ▸</span>
          <span className="hidden group-open:inline">skjul ▾</span>
        </span>
      </summary>
      <div className="border-t border-stone-200 p-4">{children}</div>
    </details>
  )
}
