export type TrackedArtifactFile = {
  path: string
  sizeBytes: number
}

export type ResearchArtifactViolationKind =
  | 'new_research_pdf'
  | 'raw_registry_document'
  | 'tracked_file_too_large'

export type ResearchArtifactViolation = {
  kind: ResearchArtifactViolationKind
  path: string
  reason: string
  sizeBytes?: number
}

export type ResearchArtifactGuardInput = {
  addedPaths: string[]
  trackedFiles: TrackedArtifactFile[]
  maxBytes: number
}

export type ResearchArtifactGuardReport = {
  maxBytes: number
  addedPathCount: number
  trackedFileCount: number
  violations: ResearchArtifactViolation[]
}

function normalizeRepoPath(path: string) {
  return path.replace(/\\/g, '/').replace(/^\.\//, '')
}

function isResearchPdf(path: string) {
  const normalized = normalizeRepoPath(path).toLowerCase()
  return normalized.endsWith('.pdf')
    && (normalized.startsWith('research/') || normalized.startsWith('docs/'))
}

function isRawRegistryDocument(path: string) {
  const normalized = normalizeRepoPath(path)
  return normalized.startsWith('research/evidence-pack/registry-sources/')
    && normalized.includes('/documents/')
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function buildResearchArtifactGuardReport(input: ResearchArtifactGuardInput): ResearchArtifactGuardReport {
  const violations: ResearchArtifactViolation[] = []

  for (const rawPath of input.addedPaths) {
    const path = normalizeRepoPath(rawPath)
    if (isResearchPdf(path)) {
      violations.push({
        kind: 'new_research_pdf',
        path,
        reason: 'New PDF evidence files should stay in external/local artifact storage; commit metadata, text extracts, URLs and hashes instead.',
      })
    }
    if (isRawRegistryDocument(path)) {
      violations.push({
        kind: 'raw_registry_document',
        path,
        reason: 'Raw registry document payloads must not be committed; keep manifest rows, headers, metadata and SHA-256 values in Git.',
      })
    }
  }

  for (const file of input.trackedFiles) {
    const path = normalizeRepoPath(file.path)
    if (file.sizeBytes >= input.maxBytes) {
      violations.push({
        kind: 'tracked_file_too_large',
        path,
        sizeBytes: file.sizeBytes,
        reason: `Tracked file is ${formatBytes(file.sizeBytes)}, above the ${formatBytes(input.maxBytes)} guardrail.`,
      })
    }
  }

  return {
    maxBytes: input.maxBytes,
    addedPathCount: input.addedPaths.length,
    trackedFileCount: input.trackedFiles.length,
    violations,
  }
}

export function formatResearchArtifactGuardReport(report: ResearchArtifactGuardReport) {
  const lines = [
    'Research artifact guard',
    `Added paths checked: ${report.addedPathCount}`,
    `Tracked files checked: ${report.trackedFileCount}`,
    `Max tracked file size: ${formatBytes(report.maxBytes)}`,
    `Violations: ${report.violations.length}`,
  ]

  if (report.violations.length > 0) {
    lines.push('')
    for (const violation of report.violations) {
      const size = violation.sizeBytes === undefined ? '' : ` (${formatBytes(violation.sizeBytes)})`
      lines.push(`- ${violation.kind}: ${violation.path}${size}`)
      lines.push(`  ${violation.reason}`)
    }
  }

  return `${lines.join('\n')}\n`
}
