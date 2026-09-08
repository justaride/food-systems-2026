import assert from 'node:assert/strict'
import { test } from 'node:test'
import { catalogPage, catalogPageInfo, literalLike } from '../../src/lib/catalog-pagination'
test('invalid or extreme pages cannot create unbounded database offsets', () => {
  for (const value of [undefined, null, 'NaN', '-3', '1.5', 'Infinity', '1e99']) assert.equal(catalogPage(value), 1)
  assert.equal(catalogPage('9999999'), 100000)
  assert.deepEqual(catalogPageInfo(51, 100000), { total: 51, page: 2, lastPage: 2, pageSize: 50 })
  assert.deepEqual(catalogPageInfo(0, 3), { total: 0, page: 1, lastPage: 1, pageSize: 50 })
})
test('search treats percent, underscore and backslash as literal text', () => {
  assert.equal(literalLike('50%_x\\y'), '%50\\%\\_x\\\\y%')
})
