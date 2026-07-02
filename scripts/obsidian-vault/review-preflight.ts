import { relative } from 'node:path'
import {
  validateInsightCandidateApprovalGate,
  validateMasterplanFrontmatterLinks,
  validateReferencedPaths,
  validateReviewPackageFrontmatterLinks,
  validateReviewProtocolDecisionGate,
  validateReviewSamples,
} from '../../src/lib/obsidian-vault'

const repoRoot = process.cwd()
const reviewDocuments =
  process.argv.length > 2
    ? process.argv.slice(2)
    : [
        'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md',
        'docs/project/plans/obsidian-kunnskapskart-vk5-review-status-2026-07-02.md',
        'docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md',
        'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md',
      ]

const result = {
  issues: [
    ...validateReferencedPaths(repoRoot, reviewDocuments).issues,
    ...validateInsightCandidateApprovalGate(repoRoot).issues,
    ...validateReviewProtocolDecisionGate(repoRoot).issues,
    ...validateReviewPackageFrontmatterLinks(repoRoot).issues,
    ...validateMasterplanFrontmatterLinks(repoRoot).issues,
    ...validateReviewSamples(repoRoot).issues,
  ],
}

if (result.issues.length > 0) {
  for (const issue of result.issues) {
    console.error(`${issue.file}: ${issue.message}`)
  }
  console.error(`vault:review-preflight failed with ${result.issues.length} issue(s)`)
  process.exit(1)
}

console.log(`vault:review-preflight ok (${reviewDocuments.map((file) => relative(repoRoot, file)).join(', ')})`)
