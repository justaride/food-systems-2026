import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

test('G-17 exposes calculated CoverageBadge surfaces beyond /kilder', () => {
  const strip = read('src/components/coverage/CoverageBadgeStrip.tsx')
  assert.match(strip, /CoverageBadge/)
  assert.match(strip, /profiles\.json/)
  assert.match(strip, /datasetIds/)

  const companies = read('src/app/selskap/SelskaperContent.tsx')
  assert.match(companies, /CoverageBadgeStrip/)
  assert.match(companies, /selskaps-finanser/)

  const map = read('src/app/kart/[country]/page.tsx')
  assert.match(map, /CoverageBadgeStrip/)
  assert.match(map, /produksjonstilskudd/)
  assert.match(map, /leveransedata/)

  const comparison = read('src/app/sammenligning/SammenligningContent.tsx')
  assert.match(comparison, /CoverageBadgeStrip/)
  assert.match(comparison, /selvforsyning-nordisk/)

  const sources = read('src/app/kilder/KilderContent.tsx')
  assert.match(sources, /CoverageOverview/)
})
