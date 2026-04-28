// Canonical personKey-normalisering for BoardMember og PersonProfile.
// AE/OE/AA normaliseres slik at "Bjorn Strand", "Bjoern Strand" og ASCII-
// importerte varianter ender pa samme nokkel.
//
// Historiske import-skript brukte varianter som strippet o/a direkte og
// produserte nokler som "bj-rn-strand" og "bjrn-strand". Bruk denne i nye
// import-skript og i berikelse, og konsolider historiske data via
// scripts/dedupe-person-keys.ts.
export function canonicalPersonKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[øöóòô]/g, 'o')
    .replace(/[åáàâä]/g, 'a')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/oe/g, 'o')
    .replace(/aa/g, 'a')
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// Foretrekker visningsnavn med o/a/ae hvis det finnes, ellers velger
// forste alfabetisk for stabilitet.
export function pickCanonicalName(names: string[]): string {
  const withDiacritics = names.find((n) => /[æøåÆØÅ]/.test(n))
  if (withDiacritics) return withDiacritics
  return [...names].sort((a, b) => a.localeCompare(b, 'nb'))[0] ?? ''
}
