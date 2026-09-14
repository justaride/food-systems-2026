import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'

// Data API routes now sit behind Cloudflare Access too (bypass narrowed and an
// in-app JWT check added 2026-09-14, PR #413). FIM holds registry roles and
// ownership names, so as defence in depth only the innovasjonskart server
// components may read it.
const ALLOWED = ['src/app/innovasjonskart/', 'src/lib/queries/fim.ts']
const FIM_ACCESS = /queries\/fim['"]|\.fimProfile\b|\.fimRelease\b/

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.posix.join(dir, entry.name)
    if (entry.isDirectory()) return full === 'src/generated' ? [] : sourceFiles(full)
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : []
  })
}

describe('FIM data isolation', () => {
  it('reads FIM data only from the innovasjonskart pages', () => {
    const readers = sourceFiles('src').filter(file => FIM_ACCESS.test(readFileSync(file, 'utf8')))
    const offenders = readers.filter(file => !ALLOWED.some(allowed => file === allowed || file.startsWith(allowed)))
    assert.deepEqual(offenders, [])
    assert.ok(readers.includes('src/lib/queries/fim.ts'), 'guard must see the FIM query module')
  })

  it('keeps FIM out of every API route', () => {
    const apiFiles = sourceFiles('src/app/api').filter(file => /fim/i.test(readFileSync(file, 'utf8')))
    assert.deepEqual(apiFiles, [])
  })
})
