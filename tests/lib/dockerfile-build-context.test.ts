import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('Docker builder includes governed knowledge files used by the API build', async () => {
  const dockerfile = await readFile(new URL('../../Dockerfile', import.meta.url), 'utf8')

  assert.match(
    dockerfile,
    /^COPY knowledge \.\/knowledge$/m,
    'Docker builder must copy knowledge/ because the API imports governed calibration data at build time',
  )
})
