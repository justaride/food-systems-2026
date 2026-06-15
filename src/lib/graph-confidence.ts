export type GraphConfidence = {
  confidence?: number
  sourceLabel?: string
}

const STRUCTURAL_GRAPH_CONFIDENCE: Record<string, GraphConfidence> = {
  'source-file': { confidence: 0.95, sourceLabel: 'kildedokument-kobling' },
  'thesis-doc': { confidence: 0.95, sourceLabel: 'masteroppgave-dokument' },
  'company-ref': { confidence: 0.9, sourceLabel: 'kurert dokumentkobling' },
  'actor-ref': { confidence: 0.9, sourceLabel: 'kurert aktørkobling' },
  'insight-ref': { confidence: 0.85, sourceLabel: 'kurert innsiktskobling' },
  'company-link': { confidence: 0.8, sourceLabel: 'aktør-selskapskobling' },
  'person-role': { confidence: 0.7, sourceLabel: 'personprofil-rolle' },
}

export function structuralGraphConfidence(edgeType: string): GraphConfidence {
  return STRUCTURAL_GRAPH_CONFIDENCE[edgeType] ?? {}
}

export function inferGraphConfidence(
  metadata: unknown,
  source: string | null | undefined,
): GraphConfidence {
  const meta = metadata as { confidence?: unknown; sourceType?: unknown } | null | undefined
  const metaConf =
    meta && typeof meta === 'object' && 'confidence' in meta ? meta.confidence : undefined

  if (typeof metaConf === 'number' && metaConf >= 0 && metaConf <= 1) {
    return { confidence: metaConf, sourceLabel: source ?? undefined }
  }

  if (!source) return { sourceLabel: undefined }
  const s = source.toLowerCase()
  if (
    s.includes('brreg') ||
    s.includes('brønnøysund') ||
    s.includes('bronnoysund') ||
    s.includes('offentligdata') ||
    s.includes('registry') ||
    s.includes('official') ||
    s.includes('proff.no')
  ) {
    return { confidence: 0.95, sourceLabel: source }
  }
  if (
    s.includes('inferred') ||
    s.includes('derived') ||
    s.includes('heuristic') ||
    s.includes('estimated')
  ) {
    return { confidence: 0.4, sourceLabel: source }
  }
  if (
    s.includes('report') ||
    s.includes('press') ||
    s.includes('pressrelease') ||
    s.includes('pressemelding') ||
    s.includes('news') ||
    s.includes('nyhet') ||
    s.includes('media') ||
    s.includes('annual') ||
    s.includes('årsrapport') ||
    s.includes('arsrapport') ||
    s.includes('børsmeld') ||
    s.includes('borsmeld')
  ) {
    return { confidence: 0.7, sourceLabel: source }
  }
  return { confidence: 0.6, sourceLabel: source }
}

export function isBlockedExternalGraphSource(source: string | null | undefined) {
  if (!source) return false
  const normalized = source.toLowerCase()
  return (
    normalized.includes('blocked-unsourced') ||
    normalized.includes('blocked_unsourced') ||
    normalized.includes('legacy_unsourced') ||
    normalized.includes('unverified-label')
  )
}
