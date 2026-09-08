type NumericLike = number | string | { toString(): string } | null | undefined

export type FinancialUnits = {
  unitScale: number
  amountCurrency: string | null
  reportingCurrency?: string | null
  fxRateNokPerUnit?: NumericLike
  fxRateSource?: string | null
}

// Select these together: reportingCurrency alone does not identify stored currency.
export const financialUnitSelect = {
  unitScale: true,
  amountCurrency: true,
  reportingCurrency: true,
  fxRateNokPerUnit: true,
  fxRateSource: true,
} as const

export function financialUnitIssue(units: FinancialUnits | null | undefined): string | null {
  if (!units?.amountCurrency) return 'Beløpsenheten er ikke avstemt. Beløp er utelatt.'
  if (![1, 1_000, 1_000_000].includes(units.unitScale)) return 'Ugyldig beløpsskala. Beløp er utelatt.'
  if (units.amountCurrency !== 'NOK') {
    const rate = units.fxRateNokPerUnit == null ? NaN : Number(units.fxRateNokPerUnit)
    if (units.amountCurrency !== units.reportingCurrency || !/^[A-Z]{3}$/.test(units.amountCurrency)
      || !Number.isFinite(rate) || rate <= 0 || !units.fxRateSource?.trim()) {
      return 'Valutaomregningen mangler dokumentert kursgrunnlag. Beløp er utelatt.'
    }
  }
  return null
}

/** Normalize exactly once using explicit storage metadata. Never infer units from source text or magnitude. */
export function financialAmountToNok(value: NumericLike, units: FinancialUnits | null | undefined): number | null {
  if (value == null || (typeof value === 'string' && !value.trim()) || financialUnitIssue(units)) return null
  const amount = Number(value)
  if (!Number.isFinite(amount)) return null
  const rate = units!.amountCurrency === 'NOK' ? 1 : Number(units!.fxRateNokPerUnit)
  const nok = amount * units!.unitScale * rate
  return Number.isFinite(nok) ? nok : null
}

// Importers replace the complete monetary payload, avoiding mixed old/new units.
export const wholeNokStorage = {
  amountCurrency: 'NOK', unitScale: 1, ebitda: null,
  reportingCurrency: null, fxRateNokPerUnit: null, fxRateSource: null, amountUnitNote: null,
} as const
export const millionNokStorage = { ...wholeNokStorage, unitScale: 1_000_000 } as const
