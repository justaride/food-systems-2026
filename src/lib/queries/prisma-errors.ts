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
