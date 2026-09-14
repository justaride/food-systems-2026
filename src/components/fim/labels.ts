export const FIM_COHORT_LABELS: Record<string, string> = {
  core: 'Kjerne (videreført)',
  fishery: 'Fiskerikobling (ny)',
}

export const FIM_EVIDENCE_STATE_LABELS: Record<string, string> = {
  registry_documented: 'Registerdokumentert',
  enriched_candidate: 'Beriket kandidat',
  candidate_notes_available: 'Kandidatnotater',
  secondary_available: 'Sekundærkilde',
  conflict_open: 'Åpen konflikt',
  not_yet_documented: 'Ikke dokumentert ennå',
  not_structured_in_inputs: 'Ikke strukturert',
  not_researched: 'Ikke undersøkt',
}

export const FIM_EVIDENCE_STATE_STYLES: Record<string, string> = {
  registry_documented: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  enriched_candidate: 'bg-sky-50 text-sky-700 border-sky-200',
  candidate_notes_available: 'bg-sky-50 text-sky-700 border-sky-200',
  secondary_available: 'bg-amber-50 text-amber-700 border-amber-200',
  conflict_open: 'bg-rose-50 text-rose-700 border-rose-200',
}

export const FIM_NEUTRAL_STYLE = 'bg-stone-100 text-stone-500 border-stone-200'

export const FIM_VERDICT_STYLES: Record<string, string> = {
  pass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  supported: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  revise: 'bg-amber-50 text-amber-700 border-amber-200',
  quarantine: 'bg-rose-50 text-rose-700 border-rose-200',
  reject: 'bg-rose-50 text-rose-700 border-rose-200',
}
