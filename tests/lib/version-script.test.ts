import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

describe('version script wiring', () => {
  it('writes local version metadata before starting the dev server', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }

    assert.match(
      packageJson.scripts?.dev ?? '',
      /^tsx scripts\/write-version\.ts && next dev$/,
    )
  })

  it('uses the commit Coolify injects into the build', () => {
    const workdir = mkdtempSync(join(tmpdir(), 'foodsystems-version-'))
    const script = resolve('scripts/write-version.ts')
    const tsx = resolve('node_modules/.bin/tsx')
    const sourceCommit = '8b191ac4416f06e175cfd16ed206b02d609bbb00'

    try {
      const result = spawnSync(tsx, [script], {
        cwd: workdir,
        encoding: 'utf8',
        env: {
          ...process.env,
          SOURCE_COMMIT: sourceCommit,
          COOLIFY_BRANCH: 'main',
          SOURCE_BRANCH: 'stale-legacy-branch',
        },
      })

      assert.equal(result.status, 0, result.stderr)
      const version = JSON.parse(
        readFileSync(join(workdir, 'src/generated/version.json'), 'utf8'),
      ) as { sha: string; shortSha: string; shaSource: string; branch: string }

      assert.equal(version.sha, sourceCommit)
      assert.equal(version.shortSha, sourceCommit.slice(0, 7))
      assert.equal(version.shaSource, 'coolify-build')
      assert.equal(version.branch, 'main')
    } finally {
      rmSync(workdir, { recursive: true, force: true })
    }
  })

  it('ignores literal unknown and malformed metadata rather than reporting it', () => {
    const workdir = mkdtempSync(join(tmpdir(), 'foodsystems-version-fallback-'))
    const script = resolve('scripts/write-version.ts')
    const tsx = resolve('node_modules/.bin/tsx')
    const fallbackCommit = 'c1d540de5f366490d81e720642d95856d2c53e72'

    try {
      const result = spawnSync(tsx, [script], {
        cwd: workdir,
        encoding: 'utf8',
        env: {
          ...process.env,
          SOURCE_COMMIT: fallbackCommit,
          COOLIFY_BRANCH: 'unknown',
          SOURCE_BRANCH: 'main',
        },
      })

      assert.equal(result.status, 0, result.stderr)
      const version = JSON.parse(
        readFileSync(join(workdir, 'src/generated/version.json'), 'utf8'),
      ) as { sha: string; shortSha: string; branch: string }

      assert.equal(version.sha, fallbackCommit)
      assert.equal(version.shortSha, 'c1d540d')
      assert.equal(version.branch, 'main')
    } finally {
      rmSync(workdir, { recursive: true, force: true })
    }
  })
})

// Kjører skriptet utenfor et git-arbeidstre (GIT_DIR peker i tomme lufta) så
// env-fallbackene faktisk brukes — det er den stien prod-bygget tar.
function runOutsideGit(env: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'write-version-'))
  try {
    execFileSync(resolve('node_modules/.bin/tsx'), [resolve('scripts/write-version.ts')], {
      cwd: dir,
      stdio: 'ignore',
      // Bevisst smalt env: arvet SOURCE_COMMIT o.l. ville forurenset fallback-kjeden.
      // NODE_ENV må med — Next utvider ProcessEnv slik at den er påkrevd.
      env: {
        PATH: process.env.PATH ?? '',
        NODE_ENV: process.env.NODE_ENV ?? 'test',
        GIT_DIR: join(dir, 'ingen-git'),
        ...env,
      },
    })
    return JSON.parse(readFileSync(join(dir, 'src/generated/version.json'), 'utf8')) as {
      sha: string
      shaSource: string
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

describe('write-version shaSource', () => {
  it('merker SOURCE_COMMIT som coolify-build, siden Coolify injiserer deployens commit', () => {
    const version = runOutsideGit({ SOURCE_COMMIT: 'c'.repeat(40) })

    assert.equal(version.sha, 'c'.repeat(40))
    assert.equal(version.shaSource, 'coolify-build')
  })

  // Kjeden foretrakk tidligere COOLIFY_GIT_COMMIT_SHA, og testen som «beviste»
  // at det virket satte variabelen selv. Coolifys kildekode inneholder den
  // ikke: den eneste variabelen den injiserer er SOURCE_COMMIT, og bare når
  // include_source_commit_in_build står på. En kandidat som aldri kan bli satt
  // i produksjon er ikke en fallback — den er en misforståelse med testdekning.
  it('leser ikke variabler Coolify aldri setter', () => {
    const version = runOutsideGit({
      COOLIFY_GIT_COMMIT_SHA: 'a'.repeat(40),
      COMMIT_SHA: 'd'.repeat(40),
      GIT_SHA: 'e'.repeat(40),
    })

    assert.equal(version.sha, 'unknown')
    assert.equal(version.shaSource, 'unknown')
  })

  // Uten SOURCE_COMMIT er 'unknown' det ærlige svaret, og /api/version svarer
  // 503 på det. Alternativet — å plukke en verdi fra en variabel noen satte en
  // gang — er nettopp det som lot endepunktet lyve i fem dager.

  it('faller til unknown når ingen kilde finnes', () => {
    const version = runOutsideGit({})

    assert.equal(version.sha, 'unknown')
    assert.equal(version.shaSource, 'unknown')
  })
})
