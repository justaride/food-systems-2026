export const CATALOG_PAGE_SIZE = 50
export type CatalogFilters = Record<string, string>
export function catalogPage(value: string | null | undefined) {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, 100_000) : 1
}
export function catalogPageInfo(total: number, requestedPage: number) {
  const lastPage = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE))
  const page = Math.min(Math.max(1, requestedPage), lastPage)
  return { total, page, lastPage, pageSize: CATALOG_PAGE_SIZE }
}
export function catalogFilter(value: string | undefined) {
  return value && !['alle', 'all'].includes(value) ? value.slice(0, 300) : null
}
export function literalLike(value: string) { return `%${value.replace(/[\\%_]/g, '\\$&')}%` }
