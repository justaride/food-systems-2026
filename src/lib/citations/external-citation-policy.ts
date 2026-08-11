import { isIP } from 'node:net'
import { isInternalSourceClass } from './citation-readiness'

export const AUDIENCES = ['external', 'internal'] as const
export type Audience = (typeof AUDIENCES)[number]

const EXTERNAL_VERIFICATION_STATUSES = new Set([
  'verified',
  'machine_verified',
  'human_verified',
])

const EXTERNAL_BLOCKED_SOURCE_CLASSES = new Set([
  'unknown',
  'legacy_unsourced',
])

const SENSITIVE_URL_PARAMETER_KEYS = new Set([
  'accesskey',
  'apikey',
  'auth',
  'authorization',
  'bearer',
  'clientsecret',
  'code',
  'cookie',
  'databaseurl',
  'dbpassword',
  'jwt',
  'key',
  'keypairid',
  'migrationdatabaseurl',
  'password',
  'passwd',
  'policy',
  'privatekey',
  'pwd',
  'session',
  'sessionid',
  'sessionkey',
  'sig',
  'signature',
])

const MAX_URL_COMPONENT_DECODE_DEPTH = 8
const MAX_NESTED_URL_DEPTH = 4

// IANA's allocated global-unicast registry is a stricter boundary than the
// merely assignable 2000::/3 block. Unlisted space is reserved for future use.
// https://www.iana.org/assignments/ipv6-unicast-address-assignments/
const EXTERNAL_PUBLIC_IPV6_CIDRS = [
  ['2001:200::', 23], ['2001:400::', 23], ['2001:600::', 23],
  ['2001:800::', 22], ['2001:c00::', 23], ['2001:e00::', 23],
  ['2001:1200::', 23], ['2001:1400::', 22], ['2001:1800::', 23],
  ['2001:1a00::', 23], ['2001:1c00::', 22], ['2001:2000::', 19],
  ['2001:4000::', 23], ['2001:4200::', 23], ['2001:4400::', 23],
  ['2001:4600::', 23], ['2001:4800::', 23], ['2001:4a00::', 23],
  ['2001:4c00::', 23], ['2001:5000::', 20], ['2001:8000::', 19],
  ['2001:a000::', 20], ['2001:b000::', 20], ['2003::', 18],
  ['2400::', 12], ['2410::', 12], ['2600::', 12], ['2610::', 23],
  ['2620::', 23], ['2630::', 12], ['2800::', 12], ['2a00::', 12],
  ['2a10::', 12], ['2c00::', 12],
] as const

// Special-purpose suballocations inside otherwise allocated space are not
// ordinary public web endpoints.
const EXTERNAL_BLOCKED_IPV6_CIDRS = [
  ['2001::', 23],
  ['2001:db8::', 32],
  ['2002::', 16],
  ['2620:4f:8000::', 48],
  ['3fff::', 20],
] as const

export type CitationPolicyInput = {
  sourceClass: string
  citationReadiness: string
  verificationStatus: string
  url: string | null
  archivedUrl: string | null
  accessedAt: Date | string | null
}

export function assessCitationUse(
  citation: CitationPolicyInput,
  audience: Audience = 'external',
) {
  const externalBlockingReasons: string[] = []

  if (citation.citationReadiness !== 'citable_external') {
    externalBlockingReasons.push(`readiness_${citation.citationReadiness || 'unknown'}`)
  }
  if (!EXTERNAL_VERIFICATION_STATUSES.has(citation.verificationStatus)) {
    externalBlockingReasons.push(`verification_${citation.verificationStatus || 'unknown'}`)
  }
  if (EXTERNAL_BLOCKED_SOURCE_CLASSES.has(citation.sourceClass)) {
    externalBlockingReasons.push(`source_class_${citation.sourceClass}`)
  }
  if (isInternalSourceClass(citation.sourceClass)) {
    externalBlockingReasons.push(`source_class_${citation.sourceClass}`)
  }
  if (!hasPublicCitationLocator(citation)) {
    externalBlockingReasons.push('missing_public_locator')
  }
  if (!citation.accessedAt) {
    externalBlockingReasons.push('missing_accessed_at')
  }

  const externalCitable = externalBlockingReasons.length === 0
  const internalBlockingReasons = [
    'failed',
    'rejected',
    'disputed',
  ].includes(citation.verificationStatus)
    ? [`verification_${citation.verificationStatus}`]
    : citation.citationReadiness === 'blocked_unsourced'
      ? ['readiness_blocked_unsourced']
      : []

  return {
    audience,
    allowedForAnswer: audience === 'external'
      ? externalCitable
      : internalBlockingReasons.length === 0,
    externalCitable,
    blockingReasons: audience === 'external'
      ? externalBlockingReasons
      : internalBlockingReasons,
  }
}

function hasPublicCitationLocator(citation: CitationPolicyInput): boolean {
  return Boolean(
    externalHttpUrl(citation.url)
    || externalHttpUrl(citation.archivedUrl),
  )
}

export function externalHttpUrl(value: string | null): string | null {
  return externalHttpUrlAtDepth(value, 0)
}

function externalHttpUrlAtDepth(value: string | null, depth: number): string | null {
  if (!value) return null
  const normalized = value.trim()
  if (!normalized || /[\u0000-\u001f\u007f]/u.test(normalized)) return null

  try {
    const url = new URL(normalized)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (url.username || url.password) return null
    if (!isPublicHostname(url.hostname)) return null
    if (hasSensitiveUrlComponents(url, depth)) return null
    return normalized
  } catch {
    return null
  }
}

function hasSensitiveUrlComponents(url: URL, depth: number): boolean {
  for (const [rawKey, rawValue] of url.searchParams) {
    const key = fullyDecodeUrlComponent(rawKey)
    const value = fullyDecodeUrlComponent(rawValue)
    if (key === null || value === null) return true
    if (
      isSensitiveUrlParameterKey(key)
      || containsSensitiveUrlData(key, depth)
      || containsSensitiveUrlData(value, depth)
    ) return true
  }

  if (!url.hash) return false
  const fragment = fullyDecodeUrlComponent(url.hash.slice(1))
  return fragment === null || containsSensitiveUrlData(fragment, depth)
}

function fullyDecodeUrlComponent(value: string): string | null {
  let decoded = value
  for (let index = 0; index < MAX_URL_COMPONENT_DECODE_DEPTH; index += 1) {
    if (!/%[0-9a-f]{2}/iu.test(decoded)) return decoded
    try {
      decoded = decodeURIComponent(decoded)
    } catch {
      return null
    }
  }
  return /%[0-9a-f]{2}/iu.test(decoded) ? null : decoded
}

function isSensitiveUrlParameterKey(value: string): boolean {
  const key = value.toLowerCase().replace(/[^a-z0-9]/gu, '')
  return SENSITIVE_URL_PARAMETER_KEYS.has(key)
    || key.includes('token')
    || key.includes('secret')
    || key.includes('password')
    || key.includes('passwd')
    || key.includes('credential')
    || key.includes('authorization')
    || key.includes('cookie')
    || key.endsWith('signature')
    || key.endsWith('apikey')
    || key.endsWith('accesskey')
    || key.endsWith('secretkey')
    || key.endsWith('privatekey')
    || key.endsWith('sessionkey')
    || key.endsWith('subscriptionkey')
}

function containsSensitiveUrlData(value: string, depth: number): boolean {
  if (/[\u0000-\u001f\u007f]/u.test(value)) return true
  const slashNormalized = value.replace(/\\/gu, '/')
  if (
    slashNormalized !== value
    && containsSensitiveUrlData(slashNormalized, depth)
  ) return true
  if (containsSensitiveAssignment(value)) return true
  if (containsLocalFileReference(value)) return true
  if (/\bbearer\s+[a-z0-9._~+\/-]{8,}/iu.test(value)) return true
  if (/[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:[^\s/@]+@/iu.test(value)) return true

  for (const match of value.matchAll(/(?=(https?:|\/\/))/giu)) {
    const index = match.index
    const marker = match[1] ?? ''
    if (
      marker === '//'
      && index > 0
      && /[\p{L}\p{N}._~/%-]/u.test(value[index - 1] ?? '')
    ) continue

    const candidate = value.slice(index).match(/^[^\s<>'"`]+/u)?.[0]
    if (!candidate) continue
    if (depth >= MAX_NESTED_URL_DEPTH) return true
    const nestedUrl = candidate.startsWith('//') ? `https:${candidate}` : candidate
    if (externalHttpUrlAtDepth(nestedUrl, depth + 1) === null) return true
  }
  return false
}

function containsSensitiveAssignment(value: string): boolean {
  for (const match of value.matchAll(/([\p{L}\p{N}_.-]{1,100})\s*["'`]?\s*[:=]/gu)) {
    if (isSensitiveUrlParameterKey(match[1] ?? '')) return true
  }
  return false
}

function containsLocalFileReference(value: string): boolean {
  return /(?:^|[\s([{"'`=,:])file:(?:\/+|[a-z]:[\\/])/iu.test(value)
    || /(?:^|[\s([{"'`=,:])(?:\/(?:Users|Volumes|home|private|tmp|var|opt|app|workspace|srv|mnt|root|etc|usr|bin|sbin|dev|proc|sys|run|nix|secrets?|boot|media|data|Library|System|Applications)(?:[\\/]|$)|\/\.(?:env|ssh|aws)(?:[\\/]|$)|[a-z]:[\\/]|\\\\[^\\\s]+\\)/iu.test(value)
}

function isPublicHostname(value: string): boolean {
  const hostname = value
    .replace(/^\[/u, '')
    .replace(/\]$/u, '')
    .replace(/\.$/u, '')
    .toLowerCase()

  if (!hostname) return false
  const ipVersion = isIP(hostname)
  if (ipVersion === 4) return isPublicIpv4(hostname)
  if (ipVersion === 6) {
    return isPublicIpv6(hostname)
  }

  if (!hostname.includes('.')) return false
  if (['test', 'invalid', 'example', 'onion', 'alt', 'arpa'].some(suffix => (
    hostname === suffix || hostname.endsWith(`.${suffix}`)
  ))) return false
  if (['example.com', 'example.net', 'example.org'].some(reservedDomain => (
    hostname === reservedDomain || hostname.endsWith(`.${reservedDomain}`)
  ))) return false
  return ![
    'localhost',
    'local',
    'localdomain',
    'internal',
    'lan',
    'home',
  ].some(suffix => hostname === suffix || hostname.endsWith(`.${suffix}`))
}

function isPublicIpv6(value: string): boolean {
  const address = ipv6ToGroups(value)
  if (address === null) return false
  if (!EXTERNAL_PUBLIC_IPV6_CIDRS.some(([network, prefixLength]) => (
    isIpv6InCidr(address, network, prefixLength)
  ))) return false

  return !EXTERNAL_BLOCKED_IPV6_CIDRS.some(([network, prefixLength]) => (
    isIpv6InCidr(address, network, prefixLength)
  ))
}

function isIpv6InCidr(address: number[], network: string, prefixLength: number): boolean {
  const networkAddress = ipv6ToGroups(network)
  if (networkAddress === null || prefixLength < 0 || prefixLength > 128) return false
  if (prefixLength === 0) return true

  const wholeGroups = Math.floor(prefixLength / 16)
  for (let index = 0; index < wholeGroups; index += 1) {
    if (address[index] !== networkAddress[index]) return false
  }

  const remainingBits = prefixLength % 16
  if (remainingBits === 0) return true
  const shift = 16 - remainingBits
  return address[wholeGroups]! >>> shift === networkAddress[wholeGroups]! >>> shift
}

function ipv6ToGroups(value: string): number[] | null {
  const halves = value.toLowerCase().split('::')
  if (halves.length > 2) return null

  const parseHalf = (half: string): string[] | null => {
    if (!half) return []
    const groups = half.split(':')
    return groups.every(group => /^[0-9a-f]{1,4}$/u.test(group)) ? groups : null
  }
  const left = parseHalf(halves[0] ?? '')
  const right = parseHalf(halves[1] ?? '')
  if (!left || !right) return null

  const explicitGroups = left.length + right.length
  const hasCompression = halves.length === 2
  if ((!hasCompression && explicitGroups !== 8) || (hasCompression && explicitGroups >= 8)) {
    return null
  }

  const groups = [
    ...left,
    ...Array(hasCompression ? 8 - explicitGroups : 0).fill('0'),
    ...right,
  ]
  if (groups.length !== 8) return null

  return groups.map(group => Number.parseInt(group, 16))
}

function isPublicIpv4(value: string): boolean {
  const octets = value.split('.').map(Number)
  const first = octets[0]!
  const second = octets[1]!
  const third = octets[2]!

  return !(
    first === 0
    || first === 10
    || first === 127
    || (first === 100 && second >= 64 && second <= 127)
    || (first === 169 && second === 254)
    || (first === 172 && second >= 16 && second <= 31)
    || (first === 192 && second === 168)
    || (first === 192 && second === 0)
    || (first === 192 && second === 31 && third === 196)
    || (first === 192 && second === 52 && third === 193)
    || (first === 192 && second === 88 && third === 99)
    || (first === 192 && second === 175 && third === 48)
    || (first === 198 && (second === 18 || second === 19))
    || (first === 198 && second === 51 && third === 100)
    || (first === 203 && second === 0 && third === 113)
    || first >= 224
  )
}
