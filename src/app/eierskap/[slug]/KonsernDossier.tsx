'use client'

import Link from 'next/link'
import type { KonsernDossierData } from '@/lib/queries/ownership'

const OWNERSHIP_TYPE_LABEL: Record<string, string> = {
  family:      'Familieeid',
  cooperative: 'Samvirke',
  state:       'Statlig',
  foreign:     'Utenlandsk',
  listed:      'Børsnotert',
  subsidiary:  'Datterselskap',
}

const OWNERSHIP_TYPE_CLASS: Record<string, string> = {
  family:      'bg-amber-50 text-amber-800 border-amber-200',
  cooperative: 'bg-teal-50 text-teal-800 border-teal-200',
  state:       'bg-blue-50 text-blue-800 border-blue-200',
  foreign:     'bg-violet-50 text-violet-800 border-violet-200',
  listed:      'bg-emerald-50 text-emerald-800 border-emerald-200',
  subsidiary:  'bg-stone-100 text-stone-700 border-stone-300',
}

function fmtRevenueMNok(nok: number | null): string {
  if (nok === null) return '—'
  const mnok = nok / 1_000_000
  if (mnok >= 1_000) return `${(mnok / 1_000).toFixed(1)} mrd`
  return `${mnok.toFixed(0)} MNOK`
}

function fmtEmployees(n: number | null): string {
  if (n === null) return '—'
  return n.toLocaleString('no-NO')
}

function fmtDaysSince(n: number | null): string {
  if (n === null) return 'Aldri'
  if (n === 0) return 'I dag'
  if (n < 30) return `${n} dager siden`
  if (n < 365) return `${Math.floor(n / 30)} mnd siden`
  return `${Math.floor(n / 365)} år siden`
}

type StatBoxProps = {
  label: string
  value: string
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="flex flex-col items-start px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg min-w-[120px]">
      <span className="text-xs text-stone-400 uppercase tracking-wide mb-1">{label}</span>
      <span className="text-lg font-bold text-stone-900 tabular-nums">{value}</span>
    </div>
  )
}

type Props = {
  dossier: KonsernDossierData
}

export function KonsernDossier({ dossier }: Props) {
  const { root, ownershipType, controllingOwner, metrics } = dossier

  const ownershipLabel = ownershipType
    ? (OWNERSHIP_TYPE_LABEL[ownershipType] ?? ownershipType)
    : null
  const ownershipClass = ownershipType
    ? (OWNERSHIP_TYPE_CLASS[ownershipType] ?? 'bg-stone-100 text-stone-700 border-stone-300')
    : null

  return (
    <div className="space-y-6">
      {/* Section 1: Header */}
      <div>
        <Link
          href="/eierskap"
          className="text-xs text-stone-400 hover:text-stone-600 hover:underline mb-2 inline-block"
        >
          &larr; Tilbake til eierskap
        </Link>

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-stone-900">{root.name}</h1>
          {ownershipLabel && ownershipClass && (
            <span
              className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full border ${ownershipClass}`}
            >
              {ownershipLabel}
            </span>
          )}
        </div>

        {controllingOwner && (
          <p className="text-sm text-stone-600 mt-1">
            Kontrollerende eier:{' '}
            <span className="font-medium text-stone-800">{controllingOwner.name}</span>
            {controllingOwner.pct !== null && (
              <span className="text-stone-500"> ({controllingOwner.pct}%)</span>
            )}
          </p>
        )}

        <div className="flex flex-wrap gap-3 mt-4">
          <StatBox
            label="Selskap i tre"
            value={metrics.treeSize.toString()}
          />
          <StatBox
            label="Sum omsetning"
            value={fmtRevenueMNok(metrics.totalRevenue)}
          />
          <StatBox
            label="Sum ansatte"
            value={fmtEmployees(metrics.totalEmployees)}
          />
          <StatBox
            label="Sist Brreg-refreshet"
            value={fmtDaysSince(metrics.daysSinceBrregRefresh)}
          />
        </div>
      </div>

      {/* Sections 2-9 will be added by Tasks 6-9 */}
    </div>
  )
}
