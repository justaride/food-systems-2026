import type { EvidenceStatus } from './types'

export const evidenceStatusBorderColor: Record<EvidenceStatus, string> = {
  observed: 'border-emerald-200',
  estimated: 'border-sky-200',
  proxy: 'border-amber-200',
  illustrative: 'border-rose-200',
}

export const chartAccentColors = {
  observed: '#059669',
  estimated: '#0284c7',
  proxy: '#d97706',
  illustrative: '#e11d48',
  neutral: '#78716c',
}
