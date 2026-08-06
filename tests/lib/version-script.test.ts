import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
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
})

// Kjører skriptet utenfor et git-arbeidstre (GIT_DIR peker i tomme lufta) så
// env-fallbackene faktisk brukes — det er den stien prod-bygget tar.
function runOutsideGit(env: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'write-version-'))
  try {
    execFileSync(resolve('node_modules/.bin/tsx'), [resolve('scripts/write-version.ts')], {
      cwd: dir,
      stdio: 'ignore',
      env: { PATH: process.env.PATH ?? '', GIT_DIR: join(dir, 'ingen-git'), ...env },
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
  it('merker Coolifys auto-injiserte SHA som coolify-auto og lar den slå manuell env', () => {
    const version = runOutsideGit({
      COOLIFY_GIT_COMMIT_SHA: 'a'.repeat(40),
      SOURCE_COMMIT: 'b'.repeat(40),
    })

    assert.equal(version.sha, 'a'.repeat(40))
    assert.equal(version.shaSource, 'coolify-auto')
  })

  it('merker den eksternt vedlikeholdte SOURCE_COMMIT som manual-env', () => {
    const version = runOutsideGit({ SOURCE_COMMIT: 'c'.repeat(40) })

    assert.equal(version.sha, 'c'.repeat(40))
    assert.equal(version.shaSource, 'manual-env')
  })

  it('faller til unknown når ingen kilde finnes', () => {
    const version = runOutsideGit({})

    assert.equal(version.sha, 'unknown')
    assert.equal(version.shaSource, 'unknown')
  })
})
