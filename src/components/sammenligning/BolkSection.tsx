import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { ResearchEvidenceBadge } from '@/components/visualization/ResearchEvidenceBadge'
import type { ResearchEvidenceStatus } from '@/lib/visualization/types'

type BolkSectionProps = {
  number: number
  title: string
  question: string
  narrative: string
  takeaway?: React.ReactNode
  charts: React.ReactNode
  table?: React.ReactNode
  seeAlso: Array<{ href: string; label: string }>
  researchStatus?: ResearchEvidenceStatus
  researchStatusDetail?: string
}

export function BolkSection({
  number,
  title,
  question,
  narrative,
  takeaway,
  charts,
  table,
  seeAlso,
  researchStatus,
  researchStatusDetail,
}: BolkSectionProps) {
  return (
    <section className="mb-12">
      <header className="mb-4">
        <p className="text-[10px] uppercase tracking-wider text-stone-400">Bolk {number}</p>
        <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
          <h2 className="text-2xl font-semibold text-stone-800">{title}</h2>
          {researchStatus && (
            <ResearchEvidenceBadge
              status={researchStatus}
              prefix="Researchstatus"
              detail={researchStatusDetail}
            />
          )}
        </div>
        <p className="text-sm text-stone-500 mt-1 italic">{question}</p>
        <p className="text-sm text-stone-700 mt-2 max-w-3xl">{narrative}</p>
      </header>

      {takeaway}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {charts}
      </div>

      {table && <Card className="mb-6">{table}</Card>}

      {seeAlso.length > 0 && (
        <div className="text-xs text-stone-500">
          <span className="font-medium text-stone-600">Se også:</span>{' '}
          {seeAlso.map((l, i) => (
            <span key={l.href}>
              <Link href={l.href} className="text-emerald-700 hover:underline">{l.label}</Link>
              {i < seeAlso.length - 1 && <span className="text-stone-300"> · </span>}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
