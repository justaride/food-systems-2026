import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

describe('DataProvenance layout integration', () => {
  it('mounts the route-aware provenance component in the root layout', () => {
    const layout = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8')
    assert.match(layout, /RouteDataProvenance/)
  })

  it('links provenance readers back to datastatus', () => {
    const componentPath = join(process.cwd(), 'src/components/layout/DataProvenance.tsx')
    assert.ok(existsSync(componentPath), 'DataProvenance component should exist')
    const source = readFileSync(componentPath, 'utf8')
    assert.match(source, /\/datastatus/)
    assert.match(source, /findRouteProvenance/)
  })
})
