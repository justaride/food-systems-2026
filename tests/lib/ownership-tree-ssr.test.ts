import assert from 'node:assert/strict'
import { it } from 'node:test'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { OwnershipTreeDiagram } from '../../src/components/charts/OwnershipTreeDiagram'
import type { OwnershipTree } from '../../src/lib/queries/ownership'

it('server-renders the complete SVG title as one text node for hydration', () => {
  const tree = {
    rootId: 'owner', rootName: 'Familien A & B',
    nodes: [{ id: 'owner', name: 'Familien A & B', orgNr: 'synthetic-owner', isSynthetic: true, ownershipType: null, valueChainStage: null }],
    edges: [],
    financialSummary: { companyCount: 0, companiesWithFinancials: 0, companiesWithSubsidy: 0, totalRevenueNok: 0, totalOperatingResultNok: 0, weightedOperatingMargin: null, totalSubsidyNok: 0, yearMatchedSubsidyNok: 0, companiesWithYearMatchedSubsidy: 0, yearMatchedSubsidySharePct: null },
  } satisfies OwnershipTree
  const html = renderToString(React.createElement(OwnershipTreeDiagram, { tree }))
  assert.match(html, /<title>Familien A &amp; B · synthetic-owner<\/title>/)
})
