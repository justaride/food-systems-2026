import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import {
  ACCEPTANCE_TESTS,
  buildCitableAcceptancePack,
  formatAcceptancePackMarkdown,
  formatAcceptanceTestsMarkdown,
} from '../src/lib/citations/citable-acceptance'

const REPO_ROOT = process.cwd()
const RESEARCH_DIR = path.join(REPO_ROOT, 'research')
const ACCEPTANCE_TESTS_MD = path.join(RESEARCH_DIR, 'CITABLE-ACCEPTANCE-TESTS.md')
const PACK_JSON = path.join(RESEARCH_DIR, 'citable-acceptance-pack-2026-05-20.json')
const PACK_MD = path.join(RESEARCH_DIR, 'citable-acceptance-pack-2026-05-20.md')

async function main() {
  await mkdir(RESEARCH_DIR, { recursive: true })

  const pack = buildCitableAcceptancePack(ACCEPTANCE_TESTS)
  await writeFile(ACCEPTANCE_TESTS_MD, formatAcceptanceTestsMarkdown(ACCEPTANCE_TESTS))
  await writeFile(PACK_JSON, `${JSON.stringify(pack, null, 2)}\n`)
  await writeFile(PACK_MD, formatAcceptancePackMarkdown(pack))

  console.log(`[citable-acceptance] wrote ${path.relative(REPO_ROOT, ACCEPTANCE_TESTS_MD)}`)
  console.log(`[citable-acceptance] wrote ${path.relative(REPO_ROOT, PACK_JSON)}`)
  console.log(`[citable-acceptance] wrote ${path.relative(REPO_ROOT, PACK_MD)}`)
  console.log(
    `[citable-acceptance] ${pack.summary.citeReady}/${pack.summary.total} cite-ready, ${pack.summary.blocked} blocked`,
  )
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
