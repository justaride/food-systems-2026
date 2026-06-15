import type { CaseStatusWord } from '@/lib/data/casestatus'

/** Delte stilkart for casestatus-oversikten og dybde-undersidene. */
export const STATUS_STYLES: Record<CaseStatusWord, string> = {
  'deckklart internt': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'deckklart internt med caveat': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'benchmark-kandidat': 'border-sky-200 bg-sky-50 text-sky-700',
  'benchmark-only': 'border-sky-200 bg-sky-50 text-sky-700',
  'needs-primary-check': 'border-amber-200 bg-amber-50 text-amber-700',
  'needs-actor-validation': 'border-amber-200 bg-amber-50 text-amber-700',
  'needs-data': 'border-amber-200 bg-amber-50 text-amber-700',
  watchlist: 'border-stone-200 bg-stone-50 text-stone-600',
  parkert: 'border-stone-200 bg-stone-100 text-stone-500',
}

export const MATURITY_LABELS: Record<string, string> = {
  kartlagt: 'Kartlagt',
  delvis: 'Delvis kartlagt',
  radar: 'Radar',
}
