import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

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

  it('uses Coolify documented source metadata in a Docker-style context', () => {
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
          COOLIFY_GIT_COMMIT_SHA: 'c1d540de5f366490d81e720642d95856d2c53e72',
          COOLIFY_GIT_BRANCH: 'stale-legacy-branch',
        },
      })

      assert.equal(result.status, 0, result.stderr)
      const version = JSON.parse(
        readFileSync(join(workdir, 'src/generated/version.json'), 'utf8'),
      ) as { sha: string; shortSha: string; branch: string }

      assert.equal(version.sha, sourceCommit)
      assert.equal(version.shortSha, '8b191ac')
      assert.equal(version.branch, 'main')
    } finally {
      rmSync(workdir, { recursive: true, force: true })
    }
  })

  it('ignores literal unknown and malformed metadata in favor of valid fallbacks', () => {
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
          SOURCE_COMMIT: 'unknown',
          COOLIFY_BRANCH: 'unknown',
          SOURCE_BRANCH: '',
          COOLIFY_GIT_COMMIT_SHA: fallbackCommit,
          COOLIFY_GIT_BRANCH: 'main',
          COMMIT_SHA: 'not-a-sha',
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
