import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { GLOSSARY_TERMS, LIST_SURFACE_GLOSSARY_TERMS } from '../../src/lib/glossary/terms'

const CATEGORIES = ['statistikk', 'prosjekt', 'status', 'kolonner'] as const

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

  it('covers the required list-surface column and status concepts', () => {
    const terms = new Set(GLOSSARY_TERMS.map((t) => t.term))
    const requiredTerms = [
      'Verdikjedetrinn',
      'Eierskapstype',
      'NACE',
      'Konsesjonsstatus',
      'Claim-status',
      'Nedlastingsstatus',
      'Kildetype',
      'Innsiktstype',
    ]

    for (const term of requiredTerms) {
      assert.ok(terms.has(term), `missing shared glossary term: ${term}`)
    }
  })

  it('defines shared term groups for every G-07 list surface', () => {
    const terms = new Set(GLOSSARY_TERMS.map((t) => t.term))
    const surfaces = ['selskap', 'aktorer', 'havbruk', 'eiendommer', 'kilder', 'produsenter', 'innsikt'] as const

    for (const surface of surfaces) {
      const group = LIST_SURFACE_GLOSSARY_TERMS[surface]
      assert.ok(group.length >= 4, `${surface} needs a substantial shared glossary group`)
      for (const term of group) {
        assert.ok(terms.has(term), `${surface} references missing shared glossary term: ${term}`)
      }
    }
  })
})
