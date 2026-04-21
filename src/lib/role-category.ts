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
  if (r.includes('vara') || r.startsWith('varap') || r.includes('vice ord')) {
    return 'vara'
  }

  // Nestleder / næstformand / varapuheenjohtaja handled above or here.
  if (r.includes('nestleder') || r.includes('næstformand') || r.includes('nestformann')) {
    return 'nestleder'
  }

  if (
    r.includes('styreleder') ||
    r.includes('styreformann') ||
    r.includes('bestyrelsesformand') ||
    r.includes('styrelseordf') ||
    r.includes('stjórnarformaður') ||
    r.includes('hallituksen puheenjohtaja')
  ) {
    return 'styreleder'
  }

  if (
    r.includes('cfo') ||
    r.includes('finansdirekt') ||
    r.includes('svp finance') ||
    r.includes('vp finance')
  ) {
    return 'cfo'
  }

  if (
    r.includes('daglig leder') ||
    r === 'adm. dir.' ||
    r.startsWith('adm. dir') ||
    r.includes('administrerende direkt') ||
    r.includes('ceo') ||
    r.includes('toimitusjohtaja') ||
    r.includes('forstjóri') ||
    r === 'direktør' ||
    r.includes('konsernsjef') ||
    r.includes('vise-konsernsjef')
  ) {
    return 'daglig_leder'
  }

  if (r.includes('ansatt')) {
    return 'ansatt'
  }

  if (
    r.includes('eier') ||
    r.includes('grunnlegger') ||
    r.includes('grunder') ||
    r.includes('founder') ||
    r.includes('aksjon') ||
    r.includes('medgrunder')
  ) {
    return 'eier'
  }

  if (
    r.includes('styremedlem') ||
    r.includes('bestyrelsesmedlem') ||
    r.includes('stjórnarmaður') ||
    r.includes('hallituksen jäsen')
  ) {
    return 'styremedlem'
  }

  return 'annet'
}
