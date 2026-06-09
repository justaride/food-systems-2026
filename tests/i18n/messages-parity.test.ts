import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import no from '../../messages/no.json'
import en from '../../messages/en.json'
import { navGroups } from '../../src/lib/data/nav'

function flatten(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object'
      ? flatten(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  )
}

describe('message catalogs', () => {
  it('no and en have identical key sets', () => {
    assert.deepEqual(
      flatten(no as Record<string, unknown>).sort(),
      flatten(en as Record<string, unknown>).sort(),
    )
  })
  it('every nav item key has a name in both catalogs', () => {
    const keys = flatten(no as Record<string, unknown>)
    for (const group of navGroups) {
      for (const item of group.items) {
        assert.ok(keys.includes(`nav.${item.key}.name`), `missing nav.${item.key}.name`)
      }
    }
  })
})
