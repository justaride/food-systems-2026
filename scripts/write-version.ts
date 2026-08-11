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

function firstValidSha(...candidates: Array<string | undefined>): string | undefined {
  return candidates
    .map(candidate => candidate?.trim().toLowerCase())
    .find(candidate => Boolean(candidate && candidate !== 'unknown' && /^[a-f0-9]{40,64}$/.test(candidate)))
}

function firstKnownValue(...candidates: Array<string | undefined>): string | undefined {
  return candidates
    .map(candidate => candidate?.trim())
    .find(candidate => Boolean(candidate && candidate.toLowerCase() !== 'unknown'))
}

// Priority order:
//   1. git rev-parse — best when .git is available
//   2. Coolify's auto-injected commit — preferred whenever it is available
//   3. SOURCE_COMMIT — synchronized by the guarded release workflow because
//      this Coolify installation does not currently expose the automatic SHA
//      inside its Docker build
//   4. generic CI fallbacks
// `shaSource` sier hvilket ledd som vant. Bare `manual-env` vedlikeholdes
// utenfra bygget (coolify-sync-source-commit.yml) og kan derfor bli stale —
// da peker /api/version på feil commit uten å si fra. Ved å skrive kilden
// ned blir et stale stempel synlig i stedet for stille.
const SHA_CANDIDATES: ReadonlyArray<readonly [string, string | undefined]> = [
  ['git', tryGit('rev-parse HEAD')],
  ['coolify-auto', process.env.COOLIFY_GIT_COMMIT_SHA],
  ['manual-env', process.env.SOURCE_COMMIT],
  ['manual-env', process.env.COMMIT_SHA],
  ['manual-env', process.env.GIT_SHA],
]
const validCandidate = SHA_CANDIDATES
  .map(([source, candidate]) => [source, firstValidSha(candidate)] as const)
  .find(([, candidate]) => candidate)
const [shaSource, sha] = validCandidate ?? ['unknown', 'unknown']

const branchRaw = tryGit('rev-parse --abbrev-ref HEAD')
const branch =
  branchRaw && branchRaw !== 'HEAD'
    ? branchRaw
    : firstKnownValue(
        process.env.COOLIFY_BRANCH,
        process.env.SOURCE_BRANCH,
        process.env.COOLIFY_GIT_BRANCH,
        process.env.GIT_BRANCH,
      ) ?? 'unknown'

const version = {
  sha,
  shortSha: sha === 'unknown' ? 'unknown' : sha.slice(0, 7),
  shaSource,
  branch,
  builtAt: new Date().toISOString(),
}

mkdirSync(dirname(OUTPUT), { recursive: true })
writeFileSync(OUTPUT, JSON.stringify(version, null, 2) + '\n')

console.log(
  `[write-version] wrote ${OUTPUT}: ${version.shortSha} on ${version.branch} (kilde: ${version.shaSource})`,
)
