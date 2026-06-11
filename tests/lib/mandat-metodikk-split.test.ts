import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

function readSource(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('G-11 mandate and methodology split', () => {
  it('keeps claim-board and opportunity-radar surfaces on /mandat only', () => {
    const mandate = readSource('src/app/mandat/MandatContent.tsx')
    const methodology = readSource('src/app/metodikk/page.tsx')

    assert.match(mandate, /Claim og evidence board/)
    assert.match(mandate, /Opportunity radar/)
    assert.match(mandate, /foodTgClaimBoard/)
    assert.match(mandate, /foodTgOpportunityRadar/)

    assert.doesNotMatch(methodology, /Claim og evidence board/)
    assert.doesNotMatch(methodology, /Opportunity radar/)
    assert.doesNotMatch(methodology, /foodTgClaimBoard/)
    assert.doesNotMatch(methodology, /foodTgOpportunityRadar/)
    assert.doesNotMatch(methodology, /validationKpis|statusCounts/)
  })

  it('gives /mandat and /metodikk distinct H1 and ingress copy', () => {
    const mandate = readSource('src/app/mandat/MandatContent.tsx')
    const methodology = readSource('src/app/metodikk/page.tsx')

    assert.match(mandate, /<h1[^>]*>\{foodTgMandateSummary\.title\}<\/h1>/)
    assert.doesNotMatch(mandate, /<h1[^>]*>Metodikk<\/h1>/)
    assert.match(mandate, /claim\/status-cockpit|claim-\/status-cockpit|styringsflate/)

    assert.match(methodology, /<h1[^>]*>Metodikk<\/h1>/)
    assert.match(methodology, /metodeflate|metode-side|Ten-Step/)
    assert.doesNotMatch(methodology, /mandat og validering, KPIs/)
  })

  it('keeps cross-links between the two pages instead of redirecting either route away', () => {
    const mandatePage = readSource('src/app/mandat/page.tsx')
    const methodologyPage = readSource('src/app/metodikk/page.tsx')
    const mandateContent = readSource('src/app/mandat/MandatContent.tsx')
    const header = readSource('src/components/layout/Header.tsx')

    assert.match(mandatePage, /MandatContent/)
    assert.match(methodologyPage, /href="\/mandat"/)
    assert.match(mandateContent, /href="\/metodikk"/)
    assert.match(header, /href: '\/mandat'/)
  })

  it('labels navigation so readers can choose the right surface', () => {
    const no = JSON.parse(readSource('messages/no.json')) as { nav: Record<string, { description: string }> }
    const en = JSON.parse(readSource('messages/en.json')) as { nav: Record<string, { description: string }> }

    assert.match(no.nav.mandat.description, /claim\/status-cockpit|claim-\/status-cockpit|status-cockpit/i)
    assert.match(no.nav.metodikk.description, /metodeflate|metode-side/i)
    assert.doesNotMatch(no.nav.metodikk.description, /claims og validering/i)

    assert.match(en.nav.mandat.description, /claim\/status cockpit|claim-status cockpit|status cockpit/i)
    assert.match(en.nav.metodikk.description, /method surface|method page/i)
    assert.doesNotMatch(en.nav.metodikk.description, /claims and validation/i)
  })
})
