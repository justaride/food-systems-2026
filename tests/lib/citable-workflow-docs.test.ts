import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts: Record<string, string>
}
const statusDoc = readFileSync('research/CITABLE-KNOWLEDGE-BASE-STATUS.md', 'utf8')
const academicPlan = readFileSync('research/AKADEMISK-KILDEHANDTERING-PLAN.md', 'utf8')

describe('citable workflow documentation', () => {
  it('defines standard citable audit package scripts', () => {
    assert.equal(
      packageJson.scripts['audit:citations'],
      'tsx scripts/verify-data-integrity.ts --strict-sources',
    )
    assert.equal(packageJson.scripts['audit:citable-reports'], 'tsx scripts/audit-citable-reports.ts')
    assert.equal(
      packageJson.scripts['audit:citable'],
      'npm run db:audit && npm run audit:citations && npm run audit:citable-reports && npm run research:citation-readiness-queue',
    )
  })

  it('documents the operator sequence and fail-closed external-use rule', () => {
    const commands = [
      'npm test',
      'npm run lint',
      'npm run db:audit',
      'npm run db:audit:strict-sources',
      'npm run audit:citable-reports',
      'npm run research:citation-readiness-queue',
      'npm run research:citable-acceptance-pack',
      'npm run build',
    ]

    for (const command of commands) {
      assert.ok(statusDoc.includes(command), `${command} missing from status doc`)
    }

    assert.match(
      academicPlan,
      /If a claim has no external-ready citation, the system must either exclude it from external output or display it as internal context\./,
    )
    assert.match(
      academicPlan,
      /It must not silently promote internal synthesis to source evidence\./,
    )
  })
})
