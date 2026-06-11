import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

describe('/datastatus page', () => {
  const pagePath = join(process.cwd(), 'src/app/datastatus/page.tsx')

  it('renders the internal data-status surface from the shared status contract', () => {
    assert.ok(existsSync(pagePath), 'src/app/datastatus/page.tsx should exist')
    const source = readFileSync(pagePath, 'utf8')

    assert.match(source, /InternalBanner/)
    assert.match(source, /fieldCoverage/)
    assert.match(source, /operationalGaps/)
    assert.match(source, /artifacts/)
  })
})
