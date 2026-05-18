import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildCitationApplicationPreflight,
  parseCitationApplicationPacketCsv,
  validateCitationApplicationPacketRows,
} from '../../scripts/lib/citation-application-packet'

const header = [
  'action_id',
  'entity',
  'entity_type',
  'target_record_ids',
  'field_paths',
  'document_id',
  'source_locator',
  'db_resolution_status',
  'application_status',
  'apply_allowed',
  'recommended_db_change',
  'citation_action',
  'blocker_or_decision',
].join(',')

describe('citation application packet', () => {
  it('refuses blocked rows even when an approval id is supplied', () => {
    const rows = parseCitationApplicationPacketCsv([
      header,
      'CF-BLOCKED,ASKO Norge AS,CompanyFinancial,fin-1,revenueNok,,research/asko.json,resolved,blocked_mismatch,no,Do not cite,No citation,Source mismatch',
      'CF-ROUNDING,NorgesGruppen ASA,CompanyFinancial,fin-2,revenueNok;operatingResult,doc-1,research/ng.txt,resolved,ready_after_value_policy,conditional,Accept rounded values,Create citations,Rounding decision required',
    ].join('\n'))

    const preflight = buildCitationApplicationPreflight(rows, {
      approvedActionIds: new Set(['CF-BLOCKED', 'CF-ROUNDING']),
    })

    assert.deepEqual(preflight.acceptedConditional.map(row => row.actionId), ['CF-ROUNDING'])
    assert.deepEqual(preflight.refusedApprovals.map(item => item.actionId), ['CF-BLOCKED'])
    assert.equal(preflight.hasUnsafeApproval, true)
  })

  it('requires conditional rows to identify target records and field paths', () => {
    const rows = parseCitationApplicationPacketCsv([
      header,
      'SH-MISSING,BAMA Gruppen AS,Shareholder,,ownershipPct,,research/bama.txt,resolved,ready_after_name_normalization,conditional,Normalize names,Create citations,Legal-name decision required',
    ].join('\n'))

    assert.deepEqual(validateCitationApplicationPacketRows(rows).map(issue => issue.message), [
      'SH-MISSING: conditional citation row must have target_record_ids',
    ])
  })

  it('summarizes registry acquisition rows separately from citation rows', () => {
    const rows = parseCitationApplicationPacketCsv([
      header,
      'REG-DK,Danish companies,Registry,,,,research/nordic-registry.csv,not_applicable,registry_source_identified,manual_or_api_queue,Build CVR path,No FieldCitation until source artifacts are acquired,Extraction not implemented',
      'CF-ROUNDING,NorgesGruppen ASA,CompanyFinancial,fin-2,revenueNok,doc-1,research/ng.txt,resolved,ready_after_value_policy,conditional,Accept rounded values,Create citations,Rounding decision required',
    ].join('\n'))

    const preflight = buildCitationApplicationPreflight(rows)

    assert.equal(preflight.summary.totalRows, 2)
    assert.equal(preflight.summary.registryQueueRows, 1)
    assert.equal(preflight.summary.conditionalRows, 1)
    assert.equal(preflight.summary.blockedRows, 0)
  })

  it('summarizes already applied rows separately from pending conditional rows', () => {
    const rows = parseCitationApplicationPacketCsv([
      header,
      'SH-BAMA-2024,BAMA Gruppen AS,Shareholder,sh-1;sh-2,name;ownershipPct,,research/bama.txt,resolved,applied_2026-05-18,applied,Already normalized,FieldCitation created,Applied locally',
      'CF-ROUNDING,NorgesGruppen ASA,CompanyFinancial,fin-2,revenueNok,doc-1,research/ng.txt,resolved,ready_after_value_policy,conditional,Accept rounded values,Create citations,Rounding decision required',
    ].join('\n'))

    const preflight = buildCitationApplicationPreflight(rows)

    assert.equal(preflight.summary.totalRows, 2)
    assert.equal(preflight.summary.appliedRows, 1)
    assert.equal(preflight.summary.conditionalRows, 1)
    assert.deepEqual(preflight.validationIssues, [])
  })
})
