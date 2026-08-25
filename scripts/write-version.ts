/**
 * Skriver src/generated/version.json med git-SHA, branch og build-tid.
 * Kjøres som første ledd i `npm run build` slik at /api/version
 * eksponerer hva som faktisk er deployet.
 *
 * ── Hvorfor kjeden ser ut som den gjør (målt mot produksjon 2026-08-16) ──
 *
 * 1. `git rev-parse` virker lokalt og i CI, men ALDRI i et Coolify-bygg:
 *    Coolify sletter arbeidstreets .git før build.sh kjører
 *    (`rm -fr {basedir}/.git`, ApplicationDeploymentJob.php).
 *
 * 2. `SOURCE_COMMIT` er den ENESTE variabelen Coolify injiserer med deployens
 *    egen commit, og bare når per-app-innstillingen
 *    `include_source_commit_in_build` er slått PÅ. Den STÅR PÅ (verifisert i
 *    Coolify-UI 2026-08-25), så verdien kommer fra deployen selv og kan ikke
 *    bli stale — derfor er stempelet `coolify-build`.
 *
 * `COOLIFY_GIT_COMMIT_SHA` er fjernet. Den finnes ikke i Coolifys kildekode;
 * kjeden foretrakk en variabel som aldri blir satt, og testen som «beviste»
 * det satte den selv. De generiske `COMMIT_SHA`/`GIT_SHA` er fjernet av
 * motsatt grunn: de kunne bare komme utenfra bygget, og det var nettopp den
 * stien som løy.
 *
 * Bakgrunn: fram til 2026-08-25 skrev workflowen `coolify-deploy-verify`
 * (den gang `coolify-sync-source-commit`)
 * en eksplisitt SOURCE_COMMIT-miljøvariabel til appen, og den SKYGGET for den
 * Coolify injiserer. Workflowen sluttet å kunne fyre da de daglige commitene
 * til main ble laget av `github-actions[bot]` — en push med GITHUB_TOKEN
 * utløser per GitHubs design ingen workflows. Coolifys egen webhook-deploy
 * brydde seg ikke, så imaget avanserte mens /api/version ble stående: fem
 * dager på 9443177b i august, og ~40 minutter på 55ed5d7 den 25. mens prod
 * kjørte b41ad9f. Begge ganger så verdien helt fersk ut, fordi `builtAt` var
 * korrekt. Den manuelle variabelen er slettet, og en test vokter at
 * workflowen aldri skriver den igjen.
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

// To ledd. `shaSource` skrives fortsatt ned, men stempelet er snudd fra
// `manual-env` til `coolify-build`: `manual-env` betydde «denne verdien
// vedlikeholdes utenfra bygget og kan være stale», og det var sant så lenge en
// workflow skrev variabelen. Nå injiserer Coolify den med deployens egen
// commit, så det gamle stempelet ville selv vært en foreldet påstand — akkurat
// den sorten det ble laget for å avsløre.
const SHA_CANDIDATES: ReadonlyArray<readonly [string, string | undefined]> = [
  ['git', tryGit('rev-parse HEAD')],
  ['coolify-build', process.env.SOURCE_COMMIT],
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
