import { createRemoteJWKSet, errors, jwtVerify, type JWTVerifyGetKey } from 'jose'

/**
 * Cloudflare Access sits in front of the app and forwards a signed JWT in
 * `Cf-Access-Jwt-Assertion`. Checking it here means the data routes stay closed
 * even if the edge rule is widened again or someone reaches the origin directly.
 * Both values are public: the team domain is the login host and the AUD tag is
 * in every Access login redirect.
 */
export const ACCESS_TEAM_DOMAIN = 'https://naturalstatedeployments.cloudflareaccess.com'
export const ACCESS_AUD = 'c9bc1ab4bb463fb5efd957ecd0a13a2b6e6e8281a447175fb5112aa29f691e69'

/**
 * The only API routes Cloudflare lets through without Access (narrowed
 * 2026-09-14). Deploy checks and the container healthcheck read them, and they
 * carry counts and the build SHA only.
 */
export const PUBLIC_API_PATHS = new Set([
  '/api/version',
  '/api/data-status',
  '/api/library-analysis/status',
])

export type AccessDecision = 'public' | 'verified' | 'denied'

let remoteKeys: JWTVerifyGetKey | undefined

function accessKeys(): JWTVerifyGetKey {
  remoteKeys ??= createRemoteJWKSet(new URL(`${ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`))
  return remoteKeys
}

export async function checkApiAccess(
  pathname: string,
  token: string | null,
  getKey: JWTVerifyGetKey = accessKeys(),
): Promise<AccessDecision> {
  if (PUBLIC_API_PATHS.has(pathname)) return 'public'
  if (!token) return 'denied'

  try {
    await jwtVerify(token, getKey, {
      issuer: ACCESS_TEAM_DOMAIN,
      audience: ACCESS_AUD,
      algorithms: ['RS256'],
    })
    return 'verified'
  } catch (error) {
    // A bad token is the caller's problem; a key-fetch failure is ours and
    // should be visible in the logs. Both fail closed.
    if (!(error instanceof errors.JOSEError) || error instanceof errors.JWKSTimeout) {
      console.error('[api-access] Unable to verify Access token', error)
    }
    return 'denied'
  }
}
