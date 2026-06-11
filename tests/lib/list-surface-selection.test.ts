import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

function readSource(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('G-14 list surface segmentation and visible selection', () => {
  it('shows value-chain segment counts and selection meaning on /selskap', () => {
    const source = readSource('src/app/selskap/SelskaperContent.tsx')

    assert.match(source, /stageCounts/)
    assert.match(source, /Verdikjedesegmenter/)
    assert.match(source, /Kartlagt betyr/)
    assert.match(source, /href="\/metodikk"|href: '\/metodikk'/)
    assert.match(source, /filtered\.length.*companies\.length/s)
  })

  it('adds visible pagination and total context to /produsenter', () => {
    const source = readSource('src/app/produsenter/ProdusenterContent.tsx')

    assert.match(source, /PAGE_SIZE/)
    assert.match(source, /visibleRows/)
    assert.match(source, /Side \{/)
    assert.match(source, /Forrige/)
    assert.match(source, /Neste/)
    assert.match(source, /total\.toLocaleString/)
  })

  it('shows actor review dating with group fallback on /aktorer', () => {
    const source = readSource('src/app/aktorer/AktorerContent.tsx')

    assert.match(source, /lastVerifiedAt/)
    assert.match(source, /formatActorDate/)
    assert.match(source, /Sist vurdert/)
    assert.match(source, /Gruppedato/)
  })

  it('adds top anchor links and round/type/result sections on /kilder', () => {
    const source = readSource('src/app/kilder/KilderContent.tsx')

    assert.match(source, /sectionAnchors/)
    assert.match(source, /href="#kilder-runder"/)
    assert.match(source, /href="#kilder-typer"/)
    assert.match(source, /href="#kilder-resultater"/)
    assert.match(source, /id="kilder-runder"/)
    assert.match(source, /id="kilder-typer"/)
    assert.match(source, /id="kilder-resultater"/)
  })
})
