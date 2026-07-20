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
//   2. SOURCE_COMMIT / COOLIFY_BRANCH — Coolify's documented predefined vars
//      when "Include Source Commit in Build" is enabled
//   3. legacy/generic CI fallbacks
//
// Do not create a static Coolify application env named SOURCE_COMMIT. It
// shadows the predefined value and makes /api/version stale across deploys.
const sha = firstValidSha(
  tryGit('rev-parse HEAD'),
  process.env.SOURCE_COMMIT,
  process.env.COOLIFY_GIT_COMMIT_SHA,
  process.env.COMMIT_SHA,
  process.env.GIT_SHA,
) ?? 'unknown'

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
  branch,
  builtAt: new Date().toISOString(),
}

mkdirSync(dirname(OUTPUT), { recursive: true })
writeFileSync(OUTPUT, JSON.stringify(version, null, 2) + '\n')

console.log(`[write-version] wrote ${OUTPUT}: ${version.shortSha} on ${version.branch}`)
