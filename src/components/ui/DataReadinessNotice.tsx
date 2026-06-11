import type { ReactNode } from 'react'

type DataReadinessNoticeProps = {
  title: string
  children: ReactNode
  tone?: 'warn' | 'info'
}

const toneClasses = {
  warn: 'border-amber-200 bg-amber-50 text-amber-950',
  info: 'border-sky-200 bg-sky-50 text-sky-950',
}

export function DataReadinessNotice({
  title,
  children,
  tone = 'warn',
}: DataReadinessNoticeProps) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm leading-6 ${toneClasses[tone]}`} role="status">
      <p className="text-xs font-semibold uppercase tracking-wider">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  )
}
