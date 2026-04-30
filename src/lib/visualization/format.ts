export function formatNoNumber(value: number): string {
  return Math.round(value).toLocaleString('no')
}

export function formatNoPercent(value: number, maximumFractionDigits = 1): string {
  return `${value.toLocaleString('no', { maximumFractionDigits })}%`
}

export function formatPctPointDelta(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return 'ny'
  return `${value >= 0 ? '+' : ''}${value.toLocaleString('no', { maximumFractionDigits: 1 })} pp`
}
