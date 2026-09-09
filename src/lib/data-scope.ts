export type DataScopeNotice = {
  universe: string
  selection: string
  coverage: string
  period: string
  method: string
  checkedAt: string | null
  nextStep: string
}

export function describeFreshness(
  checkedAt: string | null,
  options: { generatedAt?: string | null; requiresCurrentCheck?: boolean } = {},
) {
  if (!checkedAt) {
    return options.generatedAt
      ? `Ingen kildekontroll er dokumentert. Generert ${options.generatedAt} er byggetid, ikke kildeferskhet.`
      : 'Ingen kildekontroll er dokumentert.'
  }

  const suffix = options.requiresCurrentCheck
    ? ' Tidsfølsomme fakta må kontrolleres mot primærkildene før de brukes som gjeldende.'
    : ''
  return `Kilder sist kontrollert ${checkedAt}.${suffix}`
}
