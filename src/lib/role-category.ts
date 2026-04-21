// Categorises the messy free-form role strings on BoardMember into a small set
// of canonical buckets so the UI can colour-code and filter them.

export type RoleCategory =
  | 'styreleder'
  | 'nestleder'
  | 'daglig_leder'
  | 'cfo'
  | 'styremedlem'
  | 'vara'
  | 'ansatt'
  | 'eier'
  | 'annet'

export type RoleCategoryMeta = {
  key: RoleCategory
  label: string
  // Tailwind classes for the role badge
  badgeClass: string
}

export const ROLE_CATEGORIES: Record<RoleCategory, RoleCategoryMeta> = {
  styreleder: {
    key: 'styreleder',
    label: 'Styreleder',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
  },
  nestleder: {
    key: 'nestleder',
    label: 'Nestleder',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-200',
  },
  daglig_leder: {
    key: 'daglig_leder',
    label: 'Daglig leder / CEO',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-200',
  },
  cfo: {
    key: 'cfo',
    label: 'CFO / finans',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  },
  styremedlem: {
    key: 'styremedlem',
    label: 'Styremedlem',
    badgeClass: 'bg-stone-200 text-stone-800 border-stone-300',
  },
  vara: {
    key: 'vara',
    label: 'Varamedlem',
    badgeClass: 'bg-stone-100 text-stone-600 border-stone-200',
  },
  ansatt: {
    key: 'ansatt',
    label: 'Ansattrepresentant',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-200',
  },
  eier: {
    key: 'eier',
    label: 'Eier / grunnlegger',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-200',
  },
  annet: {
    key: 'annet',
    label: 'Annet',
    badgeClass: 'bg-stone-100 text-stone-500 border-stone-200',
  },
}

export const ROLE_CATEGORY_ORDER: RoleCategory[] = [
  'styreleder',
  'nestleder',
  'daglig_leder',
  'cfo',
  'styremedlem',
  'vara',
  'ansatt',
  'eier',
  'annet',
]

// Nordic variants we see in the data (Swedish / Danish / Finnish / Icelandic).
// Matching is case-insensitive and uses substring.
export function categorizeRole(role: string | null | undefined): RoleCategory {
  const r = (role ?? '').toLowerCase().trim()
  if (!r) return 'annet'

  // Varamedlem must be checked before styremedlem (the latter is a substring
  // concept in "varastyremedlem" style phrasings).
  if (r.includes('vara') || r.startsWith('varap') || r.includes('vice ord') || r.includes('deputy')) {
    return 'vara'
  }

  // Nestleder / næstformand / varapuheenjohtaja handled above or here.
  if (
    r.includes('nestleder') ||
    r.includes('næstformand') ||
    r.includes('nestformann') ||
    r.includes('vice chair') ||
    r.includes('vise styre') ||
    r.includes('nest. styreleder')
  ) {
    return 'nestleder'
  }

  if (
    r.includes('styreleder') ||
    r.includes('styrets leder') ||
    r.includes('styreformann') ||
    r.includes('styreordforer') ||
    r.includes('styreordfører') ||
    r.includes('bestyrelsesformand') ||
    r.includes('styrelseordf') ||
    r.includes('stjórnarformaður') ||
    r.includes('hallituksen puheenjohtaja') ||
    r.includes('chair of the board') ||
    r === 'chair' ||
    r.startsWith('chair ')
  ) {
    return 'styreleder'
  }

  if (
    r.includes('cfo') ||
    r.includes('finansdirekt') ||
    r.includes('økonomidirektor') ||
    r.includes('okonomidirekt') ||
    r.includes('svp finance') ||
    r.includes('vp finance') ||
    r.includes('head of finance') ||
    r.includes('group finance')
  ) {
    return 'cfo'
  }

  if (
    r.includes('daglig leder') ||
    r === 'adm. dir.' ||
    r.startsWith('adm. dir') ||
    r.startsWith('adm.dir') ||
    r.includes('administrerende direkt') ||
    r.includes('ceo') ||
    r.includes('toimitusjohtaja') ||
    r.includes('forstjóri') ||
    r === 'direktør' ||
    r === 'direktor' ||
    r === 'dagl.leder' ||
    r === 'daglig leder og styremedlem' ||
    r.includes('konsernsjef') ||
    r.includes('vise-konsernsjef') ||
    r.includes('managing director') ||
    r === 'md' ||
    r.startsWith('md ') ||
    r.includes('general manager') ||
    r.includes('verkställande direktör') ||
    r.includes('verkstallande direktor')
  ) {
    return 'daglig_leder'
  }

  if (r.includes('ansatt') || r.includes('ansattes repr') || r.includes('employee repr')) {
    return 'ansatt'
  }

  if (
    r.includes('eier') ||
    r.includes('grunnlegger') ||
    r.includes('grunder') ||
    r.includes('gründer') ||
    r.includes('founder') ||
    r.includes('aksjon') ||
    r.includes('medgrunder') ||
    r.includes('co-founder') ||
    r.includes('owner')
  ) {
    return 'eier'
  }

  if (
    r.includes('styremedlem') ||
    r.includes('styret medlem') ||
    r.includes('medlem av styret') ||
    r.includes('board member') ||
    r.includes('bestyrelsesmedlem') ||
    r.includes('stjórnarmaður') ||
    r.includes('hallituksen jäsen') ||
    r.includes('styrelseledamot')
  ) {
    return 'styremedlem'
  }

  return 'annet'
}

// Cosmetic cleanup of raw role strings for display. Trims whitespace, fixes
// broken casing and normalises a handful of typographic variants that show up
// in Brreg / scraped data. This only affects how the role is rendered — the
// categorisation above still works on the raw string.
export function normalizeRoleLabel(role: string | null | undefined): string {
  if (!role) return ''

  let label = role.replace(/\s+/g, ' ').trim()
  if (!label) return ''

  // Common abbreviations with inconsistent punctuation / casing.
  label = label
    .replace(/^adm\.?\s*dir\.?(?=\b|$)/i, 'Adm. dir.')
    .replace(/^dagl\.?\s*leder/i, 'Daglig leder')
    .replace(/^styrets?\s+leder\b/i, 'Styreleder')
    .replace(/^styreleder\s+og\s+daglig\s+leder/i, 'Styreleder og daglig leder')
    .replace(/^nestleder\s+av\s+styret/i, 'Nestleder')
    .replace(/\bCEO\b/g, 'CEO')
    .replace(/\bCFO\b/g, 'CFO')
    .replace(/\bCOO\b/g, 'COO')

  // If the whole string is lowercase, sentence-case it.
  if (label === label.toLowerCase()) {
    label = label.charAt(0).toUpperCase() + label.slice(1)
  }

  return label
}
