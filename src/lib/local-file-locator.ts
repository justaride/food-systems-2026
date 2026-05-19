import { join } from 'node:path'

export function normalizeLocalFileLocator(filePath: string | null | undefined): string | null {
  if (!filePath) return null

  let normalized = filePath
    .trim()
    .replaceAll('\\', '/')
    .replace(/^\.?\//, '')
    .replace(/^research\//, '')

  const hashIndex = normalized.indexOf('#')
  if (hashIndex >= 0 && /\.[A-Za-z0-9]+$/.test(normalized.slice(0, hashIndex).trim())) {
    normalized = normalized.slice(0, hashIndex)
  }

  return normalized.length > 0 ? normalized : null
}

export function candidateLocalFilePaths(
  filePath: string | null | undefined,
  root = process.cwd(),
): string[] {
  const normalized = normalizeLocalFileLocator(filePath)
  if (!normalized) return []

  return [
    join(root, normalized),
    join(root, 'research', normalized),
    join(root, 'docs', normalized),
  ]
}
