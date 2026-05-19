export function normalizeMediaCountryCode(country: string) {
  return country.trim().toLowerCase()
}

export function mediaCountryMatches(entryCountry: string, appCountryCode: string) {
  return normalizeMediaCountryCode(entryCountry) === normalizeMediaCountryCode(appCountryCode)
}
