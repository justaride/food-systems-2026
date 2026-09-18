import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, it } from 'node:test'
import { ReiseContent } from '../../src/app/reise/ReiseContent'
import {
  matreiseBreadSteps,
  matreiseClaims,
  matreiseIntro,
  matreiseStations,
  matreiseTakeaways,
  type MatreiseStatus,
} from '../../src/lib/data/matreise'

const REGISTER_PATH = 'research/whitepaper/v3/pastandsregister.md'

function readRegister() {
  const rows = new Map<string, { status: string; freshCheck: string }>()
  for (const line of readFileSync(REGISTER_PATH, 'utf8').split('\n')) {
    if (!/^\| P-\d+ \|/.test(line)) continue
    const cells = line.split('|').map(cell => cell.trim())
    rows.set(cells[1], { status: cells[4], freshCheck: cells[7] })
  }
  return rows
}

// Følger «Slik leses kolonnen Status» i påstandsregisteret.
function classify(status: string): MatreiseStatus {
  if (/Blokkert|kunnskapshull|datagap/i.test(status)) return 'hull'
  if (/hypotese|spørsmål|Uklar|forslag/i.test(status)) return 'hypotese'
  if (/^Siterbar/.test(status)) return 'siterbar'
  if (/Vedtak|Metoderegel|prinsipp/i.test(status)) return 'vedtak'
  if (/Kontrollert internt|\[[A-Z/]*[KF][A-Z/]*\]/.test(status)) return 'kontrollert'
  throw new Error(`ukjent registerstatus: ${status}`)
}

function allItems() {
  return [
    ...matreiseIntro,
    ...matreiseStations.flatMap(station => [
      station.happens,
      ...station.figures.map(figure => ({ text: `${figure.value} ${figure.label}`, claims: figure.claims })),
      ...station.holds,
      ...station.breaks,
      ...station.unknown,
    ]),
    ...matreiseBreadSteps,
    ...matreiseTakeaways,
  ]
}

describe('Matreisen', () => {
  it('keeps claim status and time-critical flags in step with the claim register', () => {
    const register = readRegister()
    for (const [id, claim] of Object.entries(matreiseClaims)) {
      const row = register.get(id)
      assert.ok(row, `${id} mangler i ${REGISTER_PATH}`)
      assert.equal(claim.status, classify(row.status), `${id}: registeret sier «${row.status}»`)
      assert.equal(
        claim.timeCritical === true,
        row.freshCheck.startsWith('Tidskritisk'),
        `${id}: fersksjekk i registeret er «${row.freshCheck}»`,
      )
    }
  })

  it('references only declared claims, and uses every declared claim', () => {
    const used = new Set(allItems().flatMap(item => item.claims))
    for (const id of used) assert.ok(matreiseClaims[id], `${id} er brukt, men ikke deklarert`)
    for (const id of Object.keys(matreiseClaims)) assert.ok(used.has(id), `${id} er deklarert, men ikke brukt`)
  })

  it('never shows a number without a claim', () => {
    for (const item of allItems()) {
      if (/\d/.test(item.text)) {
        assert.ok(item.claims.length > 0, `tall uten P-ID: «${item.text}»`)
      }
    }
  })

  it('has eight ordered stations that link to real app routes', () => {
    assert.deepEqual(matreiseStations.map(station => station.order), [1, 2, 3, 4, 5, 6, 7, 8])
    assert.equal(new Set(matreiseStations.map(station => station.id)).size, 8)
    for (const station of matreiseStations) {
      assert.ok(station.holds.length > 0 && station.breaks.length > 0 && station.unknown.length > 0, station.id)
      for (const link of station.links) {
        assert.ok(existsSync(`src/app${link.href}/page.tsx`), `${station.id}: mangler rute ${link.href}`)
      }
    }
  })

  it('renders every station with the draft notice', () => {
    const html = renderToStaticMarkup(React.createElement(ReiseContent))
    assert.match(html, /<h1[^>]*>Matreisen<\/h1>/)
    assert.match(html, /Utkast · for partnere, ikke offentlig/)
    for (const station of matreiseStations) {
      assert.match(html, new RegExp(`<li id="${station.id}"`))
      assert.match(html, new RegExp(`href="#${station.id}"`))
    }
    assert.equal((html.match(/Fersksjekk<\/span>/g) ?? []).length >= 4, true)
  })
})
