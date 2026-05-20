export type UrlHealthClassification =
  | 'ok'
  | 'redirect'
  | 'dead'
  | 'blocked'
  | 'paywalled'
  | 'timeout'
  | 'server_error'
  | 'other'

export function classifyUrlStatus(status: number | string): UrlHealthClassification {
  if (typeof status === 'string') {
    if (status === 'timeout') return 'timeout'
    const lc = status.toLowerCase()
    if (
      lc.includes('refused') ||
      lc.includes('enotfound') ||
      lc.includes('getaddrinfo') ||
      lc.includes('ehostunreach') ||
      lc.includes('econnreset')
    ) {
      return 'dead'
    }
    if (lc.includes('etimedout') || lc.includes('und_err_connect_timeout')) {
      return 'timeout'
    }
    return 'other'
  }

  if (status >= 200 && status < 300) return 'ok'
  if (status >= 300 && status < 400) return 'redirect'
  if (status === 403 || status === 451) return 'blocked'
  if (status === 404 || status === 410) return 'dead'
  if (status >= 500 && status < 600) return 'server_error'
  return 'other'
}
