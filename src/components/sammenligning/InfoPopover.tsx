'use client'

import { useState } from 'react'
import { getResearchEvidenceStatusConfig } from '@/lib/visualization/status'
import type { ResearchEvidenceStatus } from '@/lib/visualization/types'

export type CountryMetaInfo = {
  code: string
  country: string
  flag: string
  status: ResearchEvidenceStatus | null
  sources: string[]
  methodNote?: string
  lastVerified?: string
}

type InfoPopoverProps = {
  year?: number | string | null
  source?: string | null
  sources?: string[]
  countryMeta?: CountryMetaInfo[]
  methodNote?: string
}

function statusDotClass(status: ResearchEvidenceStatus | null): string {
  if (!status) return 'bg-stone-300'
  switch (status) {
    case 'validated':
      return 'bg-emerald-500'
    case 'primary_snapshot':
      return 'bg-sky-500'
    case 'proxy_model':
      return 'bg-amber-500'
    case 'local_research_needs_primary_check':
      return 'bg-orange-500'
    case 'missing':
      return 'bg-rose-500'
  }
}

export function InfoPopover({ year, source, sources, countryMeta, methodNote }: InfoPopoverProps) {
  const [open, setOpen] = useState(false)
  const aggregatedSources = sources ?? (source ? [source] : [])
  const hasCountryMeta = countryMeta && countryMeta.some(m => m.status !== null || m.sources.length > 0)
  if (!year && aggregatedSources.length === 0 && !hasCountryMeta && !methodNote) return null

  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-label="Vis kilde og kvalitet"
        className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-stone-100 text-stone-500 text-[10px] font-bold hover:bg-stone-200"
        onClick={() => setOpen(o => !o)}
      >i</button>
      {open && (
        <>
          <span
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <span className="absolute right-0 top-5 z-20 w-80 p-3 text-[11px] leading-snug bg-white border border-stone-200 rounded shadow-lg text-stone-600">
            {year && (
              <span className="block font-medium text-stone-700 mb-1">År: {year}</span>
            )}
            {aggregatedSources.length > 0 && (
              <span className="block mb-2">
                <span className="text-[10px] uppercase tracking-wide text-stone-400">Kilde</span>
                {aggregatedSources.map((s, i) => (
                  <span key={i} className="block text-stone-600">{s}</span>
                ))}
              </span>
            )}
            {methodNote && (
              <span className="block mb-2 text-[10px] italic text-orange-700 bg-orange-50 rounded px-1.5 py-1 border border-orange-100">
                {methodNote}
              </span>
            )}
            {hasCountryMeta && countryMeta && (
              <span className="block mt-2 pt-2 border-t border-stone-100">
                <span className="text-[10px] uppercase tracking-wide text-stone-400 mb-1 block">Per land</span>
                {countryMeta.map(m => {
                  const cfg = m.status ? getResearchEvidenceStatusConfig(m.status) : null
                  return (
                    <span key={m.code} className="block py-1 border-b border-stone-50 last:border-0">
                      <span className="flex items-center gap-1.5">
                        <span className={`inline-block w-2 h-2 rounded-full ${statusDotClass(m.status)}`} aria-hidden="true" />
                        <span className="text-xs">{m.flag}</span>
                        <span className="text-stone-700 font-medium">{m.country}</span>
                        {cfg && (
                          <span className="ml-auto text-[9px] uppercase tracking-wide text-stone-400">{cfg.shortLabel}</span>
                        )}
                      </span>
                      {m.sources.length > 0 && (
                        <span className="block ml-3.5 text-[10px] text-stone-500 mt-0.5">
                          {m.sources.join(' · ')}
                        </span>
                      )}
                      {m.methodNote && (
                        <span className="block ml-3.5 text-[10px] italic text-orange-600 mt-0.5">
                          {m.methodNote}
                        </span>
                      )}
                      {m.lastVerified && (
                        <span className="block ml-3.5 text-[10px] text-stone-400 mt-0.5">
                          Sist verifisert: {m.lastVerified}
                        </span>
                      )}
                    </span>
                  )
                })}
              </span>
            )}
          </span>
        </>
      )}
    </span>
  )
}
