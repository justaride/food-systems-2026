import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

function readSource(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('G-10 empty table notices', () => {
  it('marks Communication emptiness directly on /kommunikasjon', () => {
    const page = readSource('src/app/kommunikasjon/page.tsx')
    const content = readSource('src/app/kommunikasjon/KommunikasjonContent.tsx')

    assert.match(page, /getCommunicationTableCount/)
    assert.match(content, /communicationTableCount/)
    assert.match(content, /Venter pa kommunikasjonslogg|Venter på kommunikasjonslogg/)
    assert.match(content, /Communication-tabellen/)
  })

  it('marks missing FishHealthObservation rows directly on /havbruk', () => {
    const page = readSource('src/app/havbruk/page.tsx')
    const content = readSource('src/app/havbruk/HavbrukContent.tsx')

    assert.match(page, /getFishHealthObservationCount/)
    assert.match(content, /fishHealthObservationCount/)
    assert.match(content, /FishHealthObservation/)
    assert.match(content, /BarentsWatch/)
  })

  it('marks intentionally narrow Landbruksregister Company coverage on /produsenter', () => {
    const page = readSource('src/app/produsenter/page.tsx')
    const content = readSource('src/app/produsenter/ProdusenterContent.tsx')

    assert.match(page, /getLandbruksregisterCompanyCount/)
    assert.match(content, /landbruksregisterCompanyCount/)
    assert.match(content, /Company-rader merket Landbruksregisteret/)
    assert.match(content, /Producer/)
  })

  it('surfaces the G-10 status notes on /datastatus', () => {
    const page = readSource('src/app/datastatus/page.tsx')

    assert.match(page, /statusNote/)
    assert.match(page, /G-10/)
    assert.match(page, /UI-merket/)
  })
})
