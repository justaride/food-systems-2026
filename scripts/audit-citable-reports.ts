import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  auditCitableReportDocuments,
  formatCitableReportAuditIssues,
  type CitableReportAuditInput,
} from '@/lib/citations/report-claim-audit'
import { collectAssertedScopes } from '@/lib/hvitbok/embeds'
import type { CoverageProfile } from '@/lib/coverage/types'

const ROOT = process.cwd()

async function readText(path: string) {
  return readFile(join(ROOT, path), 'utf8')
}

async function readProfiles(): Promise<CoverageProfile[]> {
  try {
    const raw = await readText('public/data/coverage/profiles.json')
    const parsed = JSON.parse(raw) as { profiles?: CoverageProfile[] }
    return parsed.profiles ?? []
  } catch {
    return []
  }
}

async function main() {
  const input: CitableReportAuditInput = {
    html: await readText('public/reports/nordisk-sirkularitetsrapport-2026-05.html'),
    appendix: await readText('docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md'),
    claimAudit: await readText('research/v1-2/claim-audit.md'),
    phase2: await readText('research/v1-2/phase2-primaersjekker.md'),
    selfCritique: await readText('research/v1-2/phase7-selvkritikk.md'),
    t3Diff: await readText('research/v1-2/phase8-T3-ekstern-vs-intern-diff.md'),
    readme: await readText('research/norden/sirkularitet-sprint-2026-05/README.md'),
    coverageClaims: collectAssertedScopes(),
    coverageProfiles: await readProfiles(),
  }

  const issues = auditCitableReportDocuments(input)
  console.log(formatCitableReportAuditIssues(issues))

  if (issues.some(issue => issue.severity === 'blocking')) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
