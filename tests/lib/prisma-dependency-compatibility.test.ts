import assert from 'node:assert/strict'
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'
import { loadConfigFromFile } from '@prisma/config'

const requireFromTest = createRequire(import.meta.url)
const requireFromConfig = createRequire(requireFromTest.resolve('@prisma/config'))
const { deepmerge } = requireFromConfig('deepmerge-ts') as {
  deepmerge: (...values: Record<string, unknown>[]) => Record<string, unknown>
}

test('Prisma configuration loads nested PostgreSQL and migration settings with the patched merger', async () => {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), 'foodsystems-prisma-config-')))
  const datasource = {
    url: 'postgresql://fixture:fixture@localhost:5432/fixture',
    shadowDatabaseUrl: 'postgresql://fixture:fixture@localhost:5432/shadow',
  }
  try {
    writeFileSync(join(directory, 'prisma.config.cjs'), [
      `const { defineConfig } = require(${JSON.stringify(requireFromTest.resolve('prisma/config'))});`,
      `module.exports = defineConfig(${JSON.stringify({
        schema: 'prisma/schema.prisma',
        migrations: { path: 'prisma/migrations', seed: 'node scripts/seed.js' },
        datasource,
      })});`,
    ].join('\n'))

    const loaded = await loadConfigFromFile({ configRoot: directory })
    assert.equal(loaded.error, undefined)
    assert.ok(loaded.config)
    assert.equal(loaded.config.schema, resolve(directory, 'prisma/schema.prisma'))
    assert.deepEqual(loaded.config.datasource, datasource)
    assert.deepEqual(loaded.config.migrations, {
      path: resolve(directory, 'prisma/migrations'), seed: 'node scripts/seed.js',
    })
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('the merger resolved by Prisma preserves nested configuration without mutating inputs', () => {
  const base = { migrations: { path: 'migrations' }, datasource: { url: 'base' } }
  const override = { migrations: { seed: 'seed' }, datasource: { url: 'override' } }
  assert.deepEqual(deepmerge(base, override), {
    migrations: { path: 'migrations', seed: 'seed' }, datasource: { url: 'override' },
  })
  assert.deepEqual(base, { migrations: { path: 'migrations' }, datasource: { url: 'base' } })
})

test('the merger resolved by Prisma handles recursive graphs without exhausting the stack', () => {
  const left: Record<string, unknown> = { left: true }
  const right: Record<string, unknown> = { right: true }
  left.self = left
  right.self = right
  const merged = deepmerge(left, right)
  assert.equal(merged.self, merged)
  assert.equal(merged.left, true)
  assert.equal(merged.right, true)
})
