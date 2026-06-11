import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { navGroups } from '../../src/lib/data/nav'
import {
  findRouteProvenance,
  routeProvenance,
  type RouteProvenance,
} from '../../src/lib/data/provenance'

const navHrefs = navGroups.flatMap(group => group.items.map(item => item.href))

describe('route provenance map', () => {
  it('covers every nav route with concrete sources', () => {
    for (const href of navHrefs) {
      const provenance = findRouteProvenance(href)
      assert.ok(provenance, `missing provenance for ${href}`)
      assert.ok(provenance.sources.length > 0, `${href} has no provenance sources`)
      for (const source of provenance.sources) {
        assert.notEqual(source.label.toLowerCase(), 'database', `${href} uses vague database source`)
      }
    }
  })

  it('marks fallback-sensitive routes with explicit consequences', () => {
    const requiredFallbackRoutes = ['/', '/moter', '/kommunikasjon', '/sok']
    for (const href of requiredFallbackRoutes) {
      const provenance = findRouteProvenance(href) as RouteProvenance | null
      assert.ok(provenance?.fallback, `${href} should declare fallback behavior`)
      assert.match(provenance.fallback.note, /fallback|tom|nøkkelord|statisk|arbeidsmelding/i)
      assert.ok(provenance.fallback.consequence.length > 20)
    }
  })

  it('matches nested routes to the nearest configured parent', () => {
    assert.equal(findRouteProvenance('/selskap/example')?.route, '/selskap')
    assert.equal(findRouteProvenance('/kart/no/flow')?.route, '/kart')
  })
})
