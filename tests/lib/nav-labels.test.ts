import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { navGroups } from '../../src/lib/data/nav'

describe('nav labels', () => {
  it('has no ASCII-stripped Norwegian characters', () => {
    const broken = ['Moter', 'soknader', 'Okonomi', 'Aktorer', 'eiertraer',
      'Kryssstyrer', 'Leverandorrelasjoner', 'primaerleveranser', 'spormal',
      'Nokkelpersoner', 'Sok pa tvers']
    const text = navGroups.flatMap(g => g.items.flatMap(i => [i.name, i.description])).join(' | ')
    for (const token of broken) {
      assert.ok(!text.includes(token), `nav still contains stripped token "${token}"`)
    }
  })

  it('every item has a name, href and description', () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        assert.ok(item.name && item.href && item.description, `incomplete item: ${JSON.stringify(item)}`)
      }
    }
  })
})

describe('nav structure', () => {
  it('Søk is reachable from the top group, not Bibliotek', () => {
    const top = navGroups.find(g => !g.label)
    assert.ok(top?.items.some(i => i.href === '/sok'), 'Søk should be in the top (unlabelled) group')
  })
  it('Bibliotek group no longer contains entity pages', () => {
    const bib = navGroups.find(g => g.label === 'Bibliotek')
    const entityHrefs = ['/selskap', '/personer', '/aktorer', '/sok']
    for (const href of entityHrefs) {
      assert.ok(!bib?.items.some(i => i.href === href), `${href} should not be under Bibliotek`)
    }
  })
  it('has a Produsenter group with the producer register', () => {
    const prod = navGroups.find(g => g.label === 'Produsenter & støtte')
    assert.ok(prod?.items.some(i => i.href === '/produsenter'), 'expected /produsenter in Produsenter group')
  })
})
