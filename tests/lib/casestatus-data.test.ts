import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { caseAnchors, CASESTATUS_RULE } from '../../src/lib/data/casestatus'

const ALLOWED_STATUSES = new Set([
  'deckklart internt',
  'deckklart internt med caveat',
  'needs-primary-check',
  'needs-actor-validation',
  'needs-data',
  'benchmark-kandidat',
  'benchmark-only',
  'watchlist',
  'parkert',
])

describe('casestatus data', () => {
  it('has the 09.06 case anchors plus fôr/import, with unique ids', () => {
    assert.equal(caseAnchors.length, 8)
    const ids = new Set(caseAnchors.map(c => c.id))
    assert.equal(ids.size, 8)
    assert.ok(ids.has('for-import-sjomatfor'), 'fôr/import anchor must be present')
  })

  it('every anchor is complete: status, go/no-go, figures, blockers, ikke-si, neste handling og underlag', () => {
    for (const anchor of caseAnchors) {
      assert.ok(anchor.title.length > 0, `${anchor.id} missing title`)
      assert.ok(anchor.goNoGo.length > 0, `${anchor.id} missing goNoGo`)
      assert.ok(anchor.summary.length > 50, `${anchor.id} summary too thin`)
      assert.ok(anchor.statuses.length > 0, `${anchor.id} missing statuses`)
      assert.ok(anchor.keyFigures.length > 0, `${anchor.id} missing key figures`)
      assert.ok(anchor.blockers.length > 0, `${anchor.id} missing blockers`)
      assert.ok(anchor.notSay.length > 0, `${anchor.id} missing ikke-si list`)
      assert.ok(anchor.nextActions.length > 0, `${anchor.id} missing next actions`)
      assert.ok(anchor.docRefs.length > 0, `${anchor.id} missing doc refs`)
      // JTs §7-felt: oversikten krever problem, stakeholders og finansiering på hvert anker.
      assert.ok(anchor.problem.length > 20, `${anchor.id} problem too thin`)
      assert.ok(anchor.stakeholders.length > 0, `${anchor.id} missing stakeholders`)
      assert.ok(anchor.funding.length > 0, `${anchor.id} missing funding`)
      for (const status of anchor.statuses) {
        assert.ok(ALLOWED_STATUSES.has(status), `${anchor.id} has unknown status word: ${status}`)
      }
      for (const fig of anchor.keyFigures) {
        assert.ok(fig.source.length > 0, `${anchor.id} figure "${fig.label}" missing source`)
      }
    }
  })

  it('doc refs point to files that exist in the repo', () => {
    for (const anchor of caseAnchors) {
      for (const ref of anchor.docRefs) {
        assert.doesNotThrow(() => readFileSync(ref), `${anchor.id} doc ref not found: ${ref}`)
      }
    }
  })

  it('every anchor has a case-avsjekk doc that exists for its dybde-underside', () => {
    const seen = new Set<string>()
    for (const anchor of caseAnchors) {
      assert.ok(anchor.caseAvsjekk.length > 0, `${anchor.id} missing caseAvsjekk`)
      assert.ok(
        anchor.caseAvsjekk.startsWith('docs/project/analysis/case-avsjekk/'),
        `${anchor.id} caseAvsjekk should point into the case-avsjekk folder`,
      )
      assert.ok(!seen.has(anchor.caseAvsjekk), `${anchor.id} reuses caseAvsjekk path: ${anchor.caseAvsjekk}`)
      seen.add(anchor.caseAvsjekk)
      assert.doesNotThrow(
        () => readFileSync(anchor.caseAvsjekk),
        `${anchor.id} caseAvsjekk not found: ${anchor.caseAvsjekk}`,
      )
    }
  })

  it('claim safety: bruksregel og hold-tilbake-språk er bevart', () => {
    assert.match(CASESTATUS_RULE, /[Ii]ntern/, 'bruksregel must state internal status')
    assert.match(CASESTATUS_RULE, /re-trekkes|ikke ekstern/, 'bruksregel must gate external use')
    const text = JSON.stringify(caseAnchors)
    assert.ok(!/(?<!«)BAMA blokkerer/.test(text), 'BAMA accusation must only appear inside ikke-si quotes')
    assert.ok(!/(?<!«)Valio bruker importfritt/.test(text), 'importfritt-claim must only appear inside ikke-si quotes')
    assert.ok(!/(?<!«)Island utnytter 100 %/.test(text), '100 %-claim must only appear inside ikke-si quotes')
  })
})
