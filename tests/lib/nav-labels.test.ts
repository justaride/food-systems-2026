import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { navGroups } from '../../src/lib/data/nav'
import no from '../../messages/no.json'

describe('nav labels (Norwegian catalog)', () => {
  it('has no ASCII-stripped Norwegian characters', () => {
    const broken = ['Moter', 'soknader', 'Okonomi', 'Aktorer', 'eiertraer',
      'Kryssstyrer', 'Leverandorrelasjoner', 'primaerleveranser', 'spormal',
      'Nokkelpersoner', 'Sok pa tvers']
    const nav = (no as { nav: Record<string, unknown> }).nav
    const text = Object.values(nav)
      .filter((v): v is { name?: string; description?: string } => v != null && typeof v === 'object')
      .flatMap(v => [v.name, v.description])
      .filter((s): s is string => typeof s === 'string')
      .join(' | ')
    for (const token of broken) {
      assert.ok(!text.includes(token), `nav catalog still contains stripped token "${token}"`)
    }
  })
})

describe('nav structure', () => {
  it('every item has a key and a unique href', () => {
    const hrefs = new Set<string>()
    for (const group of navGroups) {
      for (const item of group.items) {
        assert.ok(item.key && item.href, `incomplete item: ${JSON.stringify(item)}`)
        assert.ok(!hrefs.has(item.href), `duplicate href: ${item.href}`)
        hrefs.add(item.href)
      }
    }
  })
  it('Søk is reachable from the top group, not Bibliotek', () => {
    const top = navGroups.find(g => !g.groupKey)
    assert.ok(top?.items.some(i => i.href === '/sok'), 'Søk should be in the top (unlabelled) group')
  })
  it('Bibliotek group no longer contains entity pages', () => {
    const bib = navGroups.find(g => g.groupKey === 'bibliotek')
    const entityHrefs = ['/selskap', '/personer', '/aktorer', '/sok']
    for (const href of entityHrefs) {
      assert.ok(!bib?.items.some(i => i.href === href), `${href} should not be under Bibliotek`)
    }
  })
  it('has a Produsenter group with the producer register', () => {
    const prod = navGroups.find(g => g.groupKey === 'produsenter')
    assert.ok(prod?.items.some(i => i.href === '/produsenter'), 'expected /produsenter in Produsenter group')
  })
  it('exposes datastatus as an internal working surface', () => {
    const internal = navGroups.find(g => g.groupKey === 'intern')
    assert.ok(internal?.items.some(i => i.href === '/datastatus'), 'expected /datastatus in Intern group')
  })
})
