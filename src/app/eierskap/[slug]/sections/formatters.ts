export function fmtEmployees(n: number | null): string {
  if (n === null) return '—'
  return n.toLocaleString('no-NO')
}

export function fmtMnok(nok: number | null): string {
  if (nok === null) return '—'
  const mnok = nok / 1_000_000
  if (Math.abs(mnok) >= 1_000) return `${(mnok / 1_000).toFixed(1)} mrd`
  return `${mnok.toFixed(0)} MNOK`
}

export function fmtMnokSubsidy(nok: number): string {
  const mnok = nok / 1_000_000
  if (Math.abs(mnok) >= 1_000) return `${(mnok / 1_000).toFixed(1)} mrd`
  if (Math.abs(mnok) >= 1) return `${mnok.toFixed(1)} MNOK`
  return `${Math.round(nok / 1_000)} kNOK`
}

export function fmtArea(sqm: number | null): string {
  if (sqm === null) return '—'
  if (sqm >= 10_000) return `${Math.round(sqm / 1_000)} 000 m²`
  return `${sqm.toLocaleString('no-NO')} m²`
}
