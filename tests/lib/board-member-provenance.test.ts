import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import {
  resolveBoardMemberAnnualReportSourceLocator,
  resolveBoardMemberSourceLabel,
} from '../../src/lib/board-member-provenance'

describe('board-member annual-report provenance', () => {
  it('resolves explicitly mapped Nordic board rows to imported annual-report documents', () => {
    const documentRefs = new Set([
      'evidence-pack/arsrapporter/axfood-annual-report-2024',
      'evidence-pack/arsrapporter/salling-group-2024',
    ])

    assert.equal(
      resolveBoardMemberAnnualReportSourceLocator(
        { company: { orgNr: 'SE-556542-5353' } },
        documentRefs,
      ),
      'document:evidence-pack/arsrapporter/axfood-annual-report-2024',
    )
    assert.equal(
      resolveBoardMemberAnnualReportSourceLocator(
        { company: { orgNr: 'DK-35954716' } },
        documentRefs,
      ),
      'document:evidence-pack/arsrapporter/salling-group-2024',
    )
  })

  it('does not invent board provenance when the annual-report document is absent or unmapped', () => {
    assert.equal(
      resolveBoardMemberAnnualReportSourceLocator(
        { company: { orgNr: 'SE-556542-5353' } },
        new Set(),
      ),
      null,
    )
    assert.equal(
      resolveBoardMemberAnnualReportSourceLocator(
        { company: { orgNr: 'SE-000000-0000' } },
        new Set(['evidence-pack/arsrapporter/axfood-annual-report-2024']),
      ),
      null,
    )
  })

  it('resolves checked board rows to direct official annual-report URLs when no document is imported', () => {
    assert.equal(
      resolveBoardMemberAnnualReportSourceLocator(
        { company: { orgNr: 'FI-0116323-9' } },
        new Set(),
      ),
      'https://assets.ctfassets.net/8122zj5k3sy9/QLeVjrOipS3Ciocgn1D3G/ef0a70e73a569d0641aa8d9b3944db2a/S_Group_and_Sustainability_2024_www.pdf',
    )

    assert.equal(
      resolveBoardMemberAnnualReportSourceLocator(
        { company: { orgNr: 'IS-540206-2010' } },
        new Set(),
      ),
      'https://cdn.prod.website-files.com/67925c8eeba76aedbef33d30/67c5c9e3dcfeda989b2c5edd_Festi%20hf%20-%20A%CC%81rsreikningur%202024.pdf',
    )

    assert.equal(
      resolveBoardMemberAnnualReportSourceLocator(
        { company: { orgNr: 'DK-38714295' } },
        new Set(),
      ),
      'https://www.dagrofa.dk/wp-content/uploads/2025/03/DAGROFA_AaRSRAPPORT_2024.pdf',
    )

    assert.equal(
      resolveBoardMemberAnnualReportSourceLocator(
        { company: { orgNr: 'DK-14705627' } },
        new Set(),
      ),
      'https://regnskaber.cvrapi.dk/91514771/amNsb3VkczovLzAzLzgxLzBmL2U5LzJjL2RhYjUtNGVhOC1iY2EzLWExMjIwOGNiYmEwMw.pdf',
    )

    assert.equal(
      resolveBoardMemberAnnualReportSourceLocator(
        { company: { orgNr: 'FI-1615492-7' } },
        new Set(),
      ),
      'https://corporate.lidl.fi/lidl-yrityksena/johtoryhma',
    )

    assert.equal(
      resolveBoardMemberAnnualReportSourceLocator(
        { company: { orgNr: 'IS-571298-3769' } },
        new Set(),
      ),
      'https://www.samkaup.is/deild/stjorn/',
    )

    assert.equal(
      resolveBoardMemberAnnualReportSourceLocator(
        { company: { orgNr: 'SE-702001-3469' } },
        new Set(),
      ),
      'https://krafman.se/coop-sverige-ab/5567105480/sammanfattning',
    )

    assert.equal(
      resolveBoardMemberAnnualReportSourceLocator(
        { company: { orgNr: 'SE-969697-6594' } },
        new Set(),
      ),
      'https://om.lidl.se/pdf/show/131697',
    )
  })

  it('labels direct board-member sources by checked source type', () => {
    assert.equal(
      resolveBoardMemberSourceLabel(
        'https://regnskaber.cvrapi.dk/91514771/amNsb3VkczovLzAzLzgxLzBmL2U5LzJjL2RhYjUtNGVhOC1iY2EzLWExMjIwOGNiYmEwMw.pdf',
      ),
      'Board data: annual report 2024',
    )
    assert.equal(
      resolveBoardMemberSourceLabel('https://corporate.lidl.fi/lidl-yrityksena/johtoryhma'),
      'Board data: official leadership page',
    )
    assert.equal(
      resolveBoardMemberSourceLabel('https://www.samkaup.is/deild/stjorn/'),
      'Board data: official board page',
    )
    assert.equal(
      resolveBoardMemberSourceLabel(
        'https://krafman.se/coop-sverige-ab/5567105480/sammanfattning',
      ),
      'Board data: Swedish public company register via Krafman',
    )
    assert.equal(
      resolveBoardMemberSourceLabel('https://om.lidl.se/pdf/show/131697'),
      'Board data: sustainability report 2023/24',
    )
  })

  it('wires the backfill script through the tested annual-report resolver', () => {
    const source = readFileSync('scripts/backfill-board-member-provenance.ts', 'utf8')

    assert.match(source, /resolveBoardMemberAnnualReportSourceLocator/)
    assert.match(source, /sourceUrl/)
    assert.match(source, /--dry-run/)
    assert.match(source, /verifiedAt/)
  })

  it('keeps checked board seeds aligned with direct sources', () => {
    const source = readFileSync('scripts/import-company-data.ts', 'utf8')

    assert.match(source, /Guðjón Karl Reynisson/)
    assert.match(source, /Ásta S\. Fjeldsted/)
    assert.doesNotMatch(source, /Sölvi Árnason/)

    assert.match(source, /Kim Biskop/)
    assert.match(source, /Juha Riikola/)
    assert.doesNotMatch(source, /Taavi Heikkilä/)

    const dagrofaIndex = source.indexOf("name: 'Dagrofa A/S'")
    const dagrofaBlock = dagrofaIndex >= 0 ? source.slice(dagrofaIndex, dagrofaIndex + 3200) : ''
    assert.ok(dagrofaBlock, 'expected a Dagrofa seed block')
    assert.match(dagrofaBlock, /Jesper Lok/)
    assert.match(dagrofaBlock, /Liza Østergren Jensen/)
    assert.doesNotMatch(dagrofaBlock, /Martin Bruun/)

    const remaIndex = source.indexOf("name: 'REMA 1000 A/S'")
    const remaBlock = remaIndex >= 0 ? source.slice(remaIndex, remaIndex + 2200) : ''
    assert.ok(remaBlock, 'expected a REMA 1000 A/S seed block')
    assert.match(remaBlock, /Tom Kristiansen/)
    assert.match(remaBlock, /Kristin Solheim Genton/)
    assert.doesNotMatch(remaBlock, /Thomas Axen/)

    const lidlSuomiIndex = source.indexOf("name: 'Lidl Suomi Ky'")
    const lidlSuomiBlock =
      lidlSuomiIndex >= 0 ? source.slice(lidlSuomiIndex, lidlSuomiIndex + 2200) : ''
    assert.ok(lidlSuomiBlock, 'expected a Lidl Suomi seed block')
    assert.match(lidlSuomiBlock, /Conor Boyle/)
    assert.match(lidlSuomiBlock, /Sami Pyykönen/)
    assert.doesNotMatch(lidlSuomiBlock, /Nicholas Pennanen/)

    const samkaupIndex = source.indexOf("name: 'Samkaup hf'")
    const samkaupBlock = samkaupIndex >= 0 ? source.slice(samkaupIndex, samkaupIndex + 2200) : ''
    assert.ok(samkaupBlock, 'expected a Samkaup seed block')
    assert.match(samkaupBlock, /Liv Bergþórsdóttir/)
    assert.match(samkaupBlock, /Margrét Katrín Guðnadóttir/)
    assert.doesNotMatch(samkaupBlock, /Auður Daníelsdóttir/)
    assert.doesNotMatch(samkaupBlock, /Bjarni Arason/)

    const coopSverigeIndex = source.indexOf("name: 'Coop Sverige AB'")
    const coopSverigeBlock =
      coopSverigeIndex >= 0 ? source.slice(coopSverigeIndex, coopSverigeIndex + 3400) : ''
    assert.ok(coopSverigeBlock, 'expected a Coop Sverige seed block')
    assert.match(coopSverigeBlock, /Kerstin Maria Wallentin/)
    assert.match(coopSverigeBlock, /Pär Bernhard Ygge Sandström/)
    assert.match(coopSverigeBlock, /Anders Jonas Nygren/)
    assert.match(coopSverigeBlock, /Karl Anders Torell/)
    assert.doesNotMatch(coopSverigeBlock, /Meta Persdotter/)
    assert.doesNotMatch(coopSverigeBlock, /Lena Rökaas/)

    const lidlSverigeIndex = source.indexOf("name: 'Lidl Sverige KB'")
    const lidlSverigeBlock =
      lidlSverigeIndex >= 0 ? source.slice(lidlSverigeIndex, lidlSverigeIndex + 2400) : ''
    assert.ok(lidlSverigeBlock, 'expected a Lidl Sverige seed block')
    assert.match(lidlSverigeBlock, /Jakob Josefsson/)
    assert.match(lidlSverigeBlock, /Georgios Tokatlis/)
    assert.doesNotMatch(lidlSverigeBlock, /Juan Aranols/)
    assert.doesNotMatch(lidlSverigeBlock, /Anna Lund/)
  })
})
