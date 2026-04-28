/**
 * Skriver src/generated/version.json med git-SHA, branch og build-tid.
 * Kjøres som første ledd i `npm run build` slik at /api/version
 * eksponerer hva som faktisk er deployet.
 *
 * Falner gracefully tilbake til 'unknown' hvis git ikke er tilgjengelig
 * (f.eks. i et Docker build context uten .git-mappen).
 */

import { execSync } from 'child_process'
import { mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'

const OUTPUT = 'src/generated/version.json'

function tryGit(args: string): string {
  try {
    return execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return ''
  }
}

const sha =
  tryGit('rev-parse HEAD') ||
  process.env.SOURCE_COMMIT ||
  process.env.COOLIFY_GIT_COMMIT_SHA ||
  process.env.COMMIT_SHA ||
  process.env.GIT_SHA ||
  'unknown'

const branchRaw = tryGit('rev-parse --abbrev-ref HEAD')
const branch =
  branchRaw && branchRaw !== 'HEAD'
    ? branchRaw
    : process.env.SOURCE_BRANCH ||
      process.env.COOLIFY_GIT_BRANCH ||
      process.env.GIT_BRANCH ||
      'unknown'

const version = {
  sha,
  shortSha: sha === 'unknown' ? 'unknown' : sha.slice(0, 7),
  branch,
  builtAt: new Date().toISOString(),
}

mkdirSync(dirname(OUTPUT), { recursive: true })
writeFileSync(OUTPUT, JSON.stringify(version, null, 2) + '\n')

console.log(`[write-version] wrote ${OUTPUT}: ${version.shortSha} on ${version.branch}`)
