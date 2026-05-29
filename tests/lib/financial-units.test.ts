import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { financialAmountToNok } from '../../src/lib/queries/financial-units'

describe('financial unit normalization', () => {
  it('treats verified company key figures as million-NOK seed values', () => {
    assert.equal(
      financialAmountToNok(
        8898,
        'Axfood City Gross key figures 2025. SEK 8,898M net sales; SEK -192M operating profit; 1 SEK ≈ 1.00 NOK',
      ),
      8_898_000_000,
    )
  })

  it('treats Nordic annual-report labels as million-NOK seed values', () => {
    assert.equal(financialAmountToNok(84100, 'Axfood Year-End Report 2024. SEK 84.1B'), 84_100_000_000)
    assert.equal(financialAmountToNok(67400, 'Axfood Årsredovisning 2023. SEK 67.4B'), 67_400_000_000)
    assert.equal(financialAmountToNok(111900, 'Salling Group Annual Report 2024. DKK 72.2B'), 111_900_000_000)
    assert.equal(financialAmountToNok(137080, 'Kesko Annual Report 2024. EUR 11.92B'), 137_080_000_000)
    assert.equal(financialAmountToNok(164450, 'SOK tilinpäätös 2024. EUR 14.3B'), 164_450_000_000)
  })
})
