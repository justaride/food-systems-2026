export type GraphConfidence = {
  confidence?: number
  sourceLabel?: string
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
  if (s.includes('brreg') || s.includes('offentligdata') || s.includes('registry') || s.includes('official')) {
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
    s.includes('news') ||
    s.includes('media') ||
    s.includes('annual')
  ) {
    return { confidence: 0.7, sourceLabel: source }
  }
  return { sourceLabel: source }
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
