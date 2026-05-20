// Both predicates below double as the swallow-decision for query fallbacks:
// callers return an empty/degraded result when these return true. When that
// happens we log, so a drifted prod schema surfaces in the logs instead of
// silently rendering empty pages (this masked a 38-column drift once).
function logTolerated(reason: string, error: unknown) {
  const e = error as { code?: string; meta?: { modelName?: unknown }; message?: string } | null
  const model = typeof e?.meta?.modelName === 'string' ? ` ${e.meta.modelName}` : ''
  const msg = typeof e?.message === 'string' ? e.message.split('\n').find(Boolean) ?? '' : ''
  console.error(`[prisma-tolerated] ${reason} (${e?.code ?? '?'}${model}): ${msg}`)
}

export function isMissingPrismaTable(error: unknown, tablePrefix: string) {
  if (!error || typeof error !== 'object') return false

  const maybeError = error as { code?: string; message?: string; meta?: { table?: unknown; modelName?: unknown } }
  if (maybeError.code !== 'P2021') return false

  const table = typeof maybeError.meta?.table === 'string' ? maybeError.meta.table : ''
  const modelName = typeof maybeError.meta?.modelName === 'string' ? maybeError.meta.modelName : ''
  const message = typeof maybeError.message === 'string' ? maybeError.message : ''
  const haystacks = [table, modelName, message].map(value => value.toLowerCase())
  const needle = tablePrefix.toLowerCase()

  const matched = haystacks.some(value => value.includes(needle))
  if (matched) logTolerated(`missing table matching "${tablePrefix}"`, error)
  return matched
}

export function isPrismaDataUnavailable(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const maybeError = error as {
    code?: string
    message?: string
    meta?: { driverAdapterError?: unknown }
  }

  if (['P1000', 'P1001', 'P1002', 'P1010', 'P2021', 'P2022'].includes(maybeError.code ?? '')) {
    logTolerated('database unavailable / schema drift', error)
    return true
  }

  const driverError =
    maybeError.meta?.driverAdapterError && typeof maybeError.meta.driverAdapterError === 'object'
      ? maybeError.meta.driverAdapterError as { message?: string; cause?: unknown }
      : null

  const driverCause =
    driverError?.cause && typeof driverError.cause === 'object'
      ? driverError.cause as { message?: string; code?: string }
      : null

  const haystacks = [
    maybeError.message,
    driverError?.message,
    driverCause?.message,
    driverCause?.code,
  ]
    .filter((value): value is string => typeof value === 'string')
    .map(value => value.toLowerCase())

  const unavailable = haystacks.some(value =>
    value.includes('access denied') ||
    value.includes('databaseaccessdenied') ||
    value.includes("can't reach database server") ||
    value.includes('database server') ||
    value.includes('does not exist') ||
    value.includes('column') ||
    value.includes('connect') ||
    value.includes('econnrefused') ||
    value.includes('enotfound') ||
    value.includes('not available')
  )
  if (unavailable) logTolerated('database unavailable / schema drift', error)
  return unavailable
}
