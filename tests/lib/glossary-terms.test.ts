import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { GLOSSARY_TERMS } from '../../src/lib/glossary/terms'

const CATEGORIES = ['statistikk', 'prosjekt', 'status'] as const

describe('GLOSSARY_TERMS', () => {
  it('every term has a valid category', () => {
    for (const t of GLOSSARY_TERMS) {
      assert.ok((CATEGORIES as readonly string[]).includes(t.category), `bad category ${t.category} on ${t.term}`)
    }
  })
  it('each category has at least one term', () => {
    for (const c of CATEGORIES) {
      assert.ok(GLOSSARY_TERMS.some((t) => t.category === c), `no terms in ${c}`)
    }
  })
  it('terms are unique within each category', () => {
    for (const c of CATEGORIES) {
      const terms = GLOSSARY_TERMS.filter((t) => t.category === c).map((t) => t.term)
      assert.equal(new Set(terms).size, terms.length, `duplicate term in ${c}`)
    }
  })
})
