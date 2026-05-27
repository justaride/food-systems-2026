import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const kartPageSource = readFileSync('src/app/kart/[country]/page.tsx', 'utf8')

describe('kart accessibility', () => {
  it('renders a screen-reader page heading before the interactive map', () => {
    const headingIndex = kartPageSource.indexOf('<h1 className="sr-only">')
    const mapIndex = kartPageSource.indexOf('<FoodMap />')

    assert.ok(headingIndex >= 0, 'Kart page needs an sr-only h1')
    assert.ok(mapIndex > headingIndex, 'Kart h1 should appear before FoodMap in the DOM')
    assert.match(kartPageSource, /Matkart for \{COUNTRY_NAMES\[country\] \?\? country\}/)
  })
})
