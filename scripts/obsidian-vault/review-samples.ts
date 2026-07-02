import { validateReviewSamples } from '../../src/lib/obsidian-vault'

const repoRoot = process.cwd()
const result = validateReviewSamples(repoRoot)

if (result.issues.length > 0) {
  for (const issue of result.issues) {
    console.error(`${issue.file}: ${issue.message}`)
  }
  console.error(`vault:review-samples failed with ${result.issues.length} issue(s)`)
  process.exit(1)
}

console.log(
  [
    'vault:review-samples ok',
    '(NorgesGruppen sample, ownership register, company registers, person register, meeting/transcript register)',
  ].join(' '),
)
