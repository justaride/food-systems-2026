import { validateReviewCloseout } from '../../src/lib/obsidian-vault'

const repoRoot = process.cwd()
const result = validateReviewCloseout(repoRoot)

if (result.issues.length > 0) {
  for (const issue of result.issues) {
    console.error(`${issue.file}: ${issue.message}`)
  }
  console.error(`vault:review-closeout failed with ${result.issues.length} issue(s)`)
  process.exit(1)
}

console.log('vault:review-closeout ok (VK-5 protocol is closed and all review rows are resolved)')
