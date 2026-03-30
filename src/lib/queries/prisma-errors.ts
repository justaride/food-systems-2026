export function isMissingPrismaTable(error: unknown, tablePrefix: string) {
  if (!error || typeof error !== 'object') return false

  const maybeError = error as { code?: string; message?: string; meta?: { table?: unknown; modelName?: unknown } }
  if (maybeError.code !== 'P2021') return false

  const table = typeof maybeError.meta?.table === 'string' ? maybeError.meta.table : ''
  const modelName = typeof maybeError.meta?.modelName === 'string' ? maybeError.meta.modelName : ''
  const message = typeof maybeError.message === 'string' ? maybeError.message : ''
  const haystacks = [table, modelName, message].map(value => value.toLowerCase())
  const needle = tablePrefix.toLowerCase()

  return haystacks.some(value => value.includes(needle))
}

export function isPrismaDataUnavailable(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const maybeError = error as {
    code?: string
    message?: string
    meta?: { driverAdapterError?: unknown }
  }

  if (['P1000', 'P1001', 'P1002', 'P1010', 'P2021', 'P2022'].includes(maybeError.code ?? '')) return true

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

  return haystacks.some(value =>
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
}
