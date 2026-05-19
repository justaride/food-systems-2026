import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { sources } from '../../src/lib/data/sources'

describe('source registry data', () => {
  it('keeps high-priority external SourceDocs anchored to direct source URLs', () => {
    const sourceById = new Map(sources.map(source => [source.id, source]))
    const ids = [
      'src-75',
      'src-76',
      'src-81',
      'src-82',
      'src-86',
      'src-93',
      'src-95',
      'src-96',
      'src-97',
      'src-98',
      'src-99',
    ]

    for (const id of ids) {
      const source = sourceById.get(id)
      assert.ok(source, `${id} exists in source registry`)
      assert.match(source.url ?? '', /^https?:\/\//, `${id} has a direct source URL`)
    }
  })

  it('uses a directly resolvable DLF Dagligvarukartan artifact for src-82', () => {
    const source = sources.find(source => source.id === 'src-82')
    assert.ok(source, 'src-82 exists in source registry')
    assert.match(source.url ?? '', /dagligvarukartan2024.*\.pdf$/i)
  })

  it('anchors src-77 to the direct CRESSE/NHH paper URL', () => {
    const source = sources.find(source => source.id === 'src-77')
    assert.ok(source, 'src-77 exists in source registry')
    assert.equal(
      source.url,
      'https://www.cresse.info/wp-content/uploads/2023/09/2023_ps13_pa2_Strom-Halseth.pdf',
    )
  })

  it('anchors src-84 to the verified USDA/FAS Denmark DA2025-0002 artifact', () => {
    const source = sources.find(source => source.id === 'src-84')
    assert.ok(source, 'src-84 exists in source registry')
    assert.equal(source.year, 2025)
    assert.equal(source.filename, 'bibliotek/media/snapshots/dk-usda-gain-retail-2025.md')
    assert.equal(
      source.url,
      'https://apps.fas.usda.gov/newgainapi/api/Report/DownloadReportByFileName?fileName=Retail+Foods+Annual_The+Hague_Denmark_DA2025-0002.pdf',
    )
  })

  it('anchors src-85 to the verified USDA/FAS Iceland Exporter Guide artifact', () => {
    const source = sources.find(source => source.id === 'src-85')
    assert.ok(source, 'src-85 exists in source registry')
    assert.equal(source.year, 2023)
    assert.equal(source.title, 'USDA GAIN Iceland Exporter Guide')
    assert.equal(
      source.url,
      'https://apps.fas.usda.gov/newgainapi/api/Report/DownloadReportByFileName?fileName=Iceland+Exporter+Guide_The+Hague_Iceland_IC2023-0001.pdf',
    )
  })

  it('keeps Circular Cities source documents on imported canonical local paths', () => {
    const sourceById = new Map(sources.map(source => [source.id, source]))

    assert.equal(
      sourceById.get('src-124')?.filename,
      'external/circular-cities/15-nordic-policy-landscape.md',
    )
    assert.equal(
      sourceById.get('src-125')?.filename,
      'external/circular-cities/07-horizon-europe-call-analysis.md',
    )
    assert.equal(
      sourceById.get('src-126')?.filename,
      'external/circular-cities/19-nordic-added-value.md',
    )
  })

  it('keeps the research-round download backlog on its canonical CSV artifact', () => {
    const source = sources.find(source => source.id === 'src-153')
    assert.ok(source, 'src-153 exists in source registry')
    assert.equal(source.filename, 'evidence-pack/download-backlog-2026-04-20.csv')
  })
})
