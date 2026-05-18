import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { financialAmountToNok, isMillionNokFinancialSource } from '../../src/lib/queries/financial-units'

describe('financial unit normalization', () => {
  it('treats English annual-report source labels as MNOK legacy values', () => {
    assert.equal(isMillionNokFinancialSource('Hagar hf Annual Report 2024/25'), true)
    assert.equal(financialAmountToNok('14168.9', 'Hagar hf Annual Report 2024/25'), 14_168_900_000)
    assert.equal(isMillionNokFinancialSource('research/evidence-pack/arsrapporter/text/hagar-2024-25.txt'), true)
    assert.equal(financialAmountToNok('14168.9', 'research/evidence-pack/arsrapporter/text/hagar-2024-25.txt'), 14_168_900_000)
  })
})
