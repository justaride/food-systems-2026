import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { financialAmountToNok, financialUnitIssue } from '../../src/lib/queries/financial-units'

describe('explicit financial storage', () => {
  it('keeps whole NOK, including small companies and losses, without magnitude guessing', () => {
    for (const value of [579, -23, 0, 1_000_000, 90_000_000_000]) {
      assert.equal(financialAmountToNok(value, { amountCurrency: 'NOK', unitScale: 1 }), value)
    }
  })
  it('uses the same million/thousand scale for revenue, losses and EBITDA', () => {
    assert.equal(financialAmountToNok('579.11', { amountCurrency: 'NOK', unitScale: 1e6 }), 579_110_000)
    assert.equal(financialAmountToNok('-23897', { amountCurrency: 'NOK', unitScale: 1e3 }), -23_897_000)
    assert.equal(financialAmountToNok(1_200_000, { amountCurrency: 'NOK', unitScale: 1e6 }), 1_200_000_000_000)
  })
  it('does not apply source FX again to already converted Axfood MNOK', () => {
    assert.equal(financialAmountToNok(94397.69, { amountCurrency: 'NOK', reportingCurrency: 'SEK', unitScale: 1e6,
      fxRateNokPerUnit: 1.05883984, fxRateSource: 'Norges Bank 2025 average' }), 94_397_690_000)
  })
  it('converts raw foreign amounts once, using the documented rate', () => {
    assert.equal(financialAmountToNok(10, { amountCurrency: 'DKK', reportingCurrency: 'DKK', unitScale: 1e6,
      fxRateNokPerUnit: 1.57, fxRateSource: 'Norges Bank fiscal period average' }), 15_700_000)
  })
  it('withholds missing, invalid, ambiguous and undocumented currency metadata', () => {
    assert.equal(financialAmountToNok(736, undefined), null)
    for (const units of [
      { amountCurrency: null, unitScale: 1 },
      { amountCurrency: 'NOK', unitScale: 100 },
      { amountCurrency: 'EUR', reportingCurrency: 'SEK', unitScale: 1, fxRateNokPerUnit: 11, fxRateSource: 'NB' },
      { amountCurrency: 'SEK', reportingCurrency: 'SEK', unitScale: 1, fxRateNokPerUnit: 1.05 },
      { amountCurrency: 'SEK', reportingCurrency: 'SEK', unitScale: 1, fxRateNokPerUnit: -1, fxRateSource: 'NB' },
    ]) { assert.equal(financialAmountToNok(123, units), null); assert.ok(financialUnitIssue(units)) }
  })
  it('preserves nulls and rejects blank/nonfinite amounts', () => {
    for (const value of [null, undefined, '', ' ', NaN, Infinity, 'broken']) {
      assert.equal(financialAmountToNok(value, { amountCurrency: 'NOK', unitScale: 1 }), null)
    }
  })
})
