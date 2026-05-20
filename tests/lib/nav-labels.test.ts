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
