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

// Priority order:
//   1. git rev-parse — best when .git is available
//   2. Coolify's auto-injected vars — refleksjons-trygt under deploy
//   3. Generic SOURCE_COMMIT — fallback for manual builds; OBS: Coolify-
//      brukere som manuelt setter SOURCE_COMMIT i app-env vil overstyre
//      auto-injected verdi. Sjekk Coolify-env-tabellen hvis SHA blir
//      stale på prod (jf. /api/version-bug 2026-04-30 → 2026-05-12).
// `shaSource` sier hvilket ledd som vant. Bare `manual-env` vedlikeholdes
// utenfra bygget (coolify-sync-source-commit.yml) og kan derfor bli stale —
// da peker /api/version på feil commit uten å si fra. Ved å skrive kilden
// ned blir et stale stempel synlig i stedet for stille.
const SHA_CANDIDATES: ReadonlyArray<readonly [string, string]> = [
  ['git', tryGit('rev-parse HEAD')],
  ['coolify-auto', process.env.COOLIFY_GIT_COMMIT_SHA ?? ''],
  ['manual-env', process.env.SOURCE_COMMIT ?? ''],
  ['manual-env', process.env.COMMIT_SHA ?? ''],
  ['manual-env', process.env.GIT_SHA ?? ''],
]
const [shaSource, sha] = SHA_CANDIDATES.find(([, value]) => value) ?? ['unknown', 'unknown']

const branchRaw = tryGit('rev-parse --abbrev-ref HEAD')
const branch =
  branchRaw && branchRaw !== 'HEAD'
    ? branchRaw
    : process.env.COOLIFY_GIT_BRANCH ||
      process.env.SOURCE_BRANCH ||
      process.env.GIT_BRANCH ||
      'unknown'

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
