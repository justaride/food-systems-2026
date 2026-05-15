import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseCsvLine, parseCsvRecords, parseCsvRows } from '../../src/lib/csv'

describe('csv parser', () => {
  it('keeps commas inside quoted values', () => {
    assert.deepEqual(parseCsvLine('NO,"Oats, mixed grains",2024'), [
      'NO',
      'Oats, mixed grains',
      '2024',
    ])
  })

  it('unescapes double quotes in quoted values', () => {
    assert.deepEqual(parseCsvLine('"SOU 2024:8 ""Livsmedelsberedskap""",SE'), [
      'SOU 2024:8 "Livsmedelsberedskap"',
      'SE',
    ])
  })

  it('maps rows to header keys and fills missing trailing values', () => {
    assert.deepEqual(parseCsvRecords('country,value,note\nNO,44\nSE,50,review'), [
      { country: 'NO', value: '44', note: '' },
      { country: 'SE', value: '50', note: 'review' },
    ])
  })

  it('preserves snake_case headers used by generated research CSVs', () => {
    assert.deepEqual(parseCsvRecords('path,word_count,has_md_companion\nresearch/a.html,125,no'), [
      { path: 'research/a.html', word_count: '125', has_md_companion: 'no' },
    ])
  })

  it('keeps line breaks inside quoted fields', () => {
    assert.deepEqual(parseCsvRows('id,notes\nSRC-1,"first line\nsecond line"\nSRC-2,ok'), [
      ['id', 'notes'],
      ['SRC-1', 'first line\nsecond line'],
      ['SRC-2', 'ok'],
    ])
  })
})
