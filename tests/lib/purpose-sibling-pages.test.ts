import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

function readSource(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('G-12 purpose split between sibling pages', () => {
  it('adds purpose framing and sibling links to sources and library pages', () => {
    const sources = readSource('src/app/kilder/KilderContent.tsx')
    const library = readSource('src/app/bibliotek/BibliotekContent.tsx')

    assert.match(sources, /PageFraming/)
    assert.match(sources, /Hva svarer denne siden på\?/)
    assert.match(sources, /href:\s*'\/bibliotek'/)
    assert.match(sources, /Leter du etter fulltekst|fulltekstlesing/i)

    assert.match(library, /PageFraming/)
    assert.match(library, /href:\s*'\/kilder'/)
    assert.match(library, /Leter du etter kilderegister|kildeoversikt/i)
  })

  it('adds purpose framing and sibling links to value-chain and supply-chain pages', () => {
    const valueChain = readSource('src/app/verdikjede/VerdikjedeContent.tsx')
    const supplyChain = readSource('src/app/forsyningskjede/ForsyningskjedeContent.tsx')

    assert.match(valueChain, /PageFraming/)
    assert.match(valueChain, /Hva svarer denne siden på\?/)
    assert.match(valueChain, /href:\s*'\/forsyningskjede'/)
    assert.match(valueChain, /Leter du etter konkrete leverandørrelasjoner|vareflyt/i)

    assert.match(supplyChain, /PageFraming/)
    assert.match(supplyChain, /href:\s*'\/verdikjede'/)
    assert.match(supplyChain, /Leter du etter jord-til-bord|verdikjedeledd/i)
  })

  it('keeps nav descriptions distinct for each sibling pair', () => {
    const no = JSON.parse(readSource('messages/no.json')) as { nav: Record<string, { description: string }> }
    const en = JSON.parse(readSource('messages/en.json')) as { nav: Record<string, { description: string }> }

    assert.match(no.nav.kilder.description, /kilderegister|referanser|downloadstatus/i)
    assert.match(no.nav.bibliotek.description, /fulltekst|dokumentinnhold/i)
    assert.match(no.nav.verdikjede.description, /jord-til-bord|ledd/i)
    assert.match(no.nav.forsyningskjede.description, /relasjoner|leveranser|vareflyt/i)

    assert.match(en.nav.kilder.description, /source register|references|download status/i)
    assert.match(en.nav.bibliotek.description, /full-text|document content/i)
    assert.match(en.nav.verdikjede.description, /farm-to-table|stages/i)
    assert.match(en.nav.forsyningskjede.description, /relationships|deliveries|flows/i)
  })
})
