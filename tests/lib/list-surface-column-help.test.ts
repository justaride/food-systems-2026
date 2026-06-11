import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const SURFACE_FILES = [
  'src/app/selskap/SelskaperContent.tsx',
  'src/app/aktorer/AktorerContent.tsx',
  'src/app/havbruk/HavbrukContent.tsx',
  'src/app/eiendommer/EiendommerContent.tsx',
  'src/app/kilder/KilderContent.tsx',
  'src/app/produsenter/ProdusenterContent.tsx',
  'src/app/innsikt/InnsiktContent.tsx',
] as const

describe('G-07 list surface column definitions', () => {
  it('wires the shared glossary and info affordance into every scoped surface', () => {
    for (const file of SURFACE_FILES) {
      const source = readFileSync(file, 'utf8')
      assert.match(source, /ColumnHelp/, `${file} should expose header or field info affordances`)
      assert.match(source, /Glossary\s+category="kolonner"/, `${file} should render shared column glossary`)
      assert.match(source, /LIST_SURFACE_GLOSSARY_TERMS/, `${file} should use shared term groups`)
    }
  })

  it('does not leave producer table count explanations as local title-only tooltips', () => {
    const source = readFileSync('src/app/produsenter/ProdusenterContent.tsx', 'utf8')
    assert.doesNotMatch(source, /title="Antall tilskudd"/)
    assert.doesNotMatch(source, /title="Antall leveranser"/)
  })
})
