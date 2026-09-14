import { before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type CryptoKey, type JWTVerifyGetKey } from 'jose'
import { ACCESS_AUD, ACCESS_TEAM_DOMAIN, checkApiAccess, PUBLIC_API_PATHS } from '@/lib/cf-access'

describe('Cloudflare Access JWT check for /api', () => {
  let signingKey: CryptoKey
  let otherKey: CryptoKey
  let getKey: JWTVerifyGetKey

  before(async () => {
    const pair = await generateKeyPair('RS256')
    signingKey = pair.privateKey
    otherKey = (await generateKeyPair('RS256')).privateKey
    const jwk = { ...(await exportJWK(pair.publicKey)), kid: 'test-key', alg: 'RS256' }
    getKey = createLocalJWKSet({ keys: [jwk] })
  })

  function token(overrides: { aud?: string; iss?: string; exp?: string | number; key?: CryptoKey } = {}) {
    return new SignJWT({ email: 'someone@example.org' })
      .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
      .setIssuer(overrides.iss ?? ACCESS_TEAM_DOMAIN)
      .setAudience(overrides.aud ?? ACCESS_AUD)
      .setIssuedAt()
      .setExpirationTime(overrides.exp ?? '1h')
      .sign(overrides.key ?? signingKey)
  }

  it('lets only the three health routes through without a token', async () => {
    assert.deepEqual([...PUBLIC_API_PATHS].sort(), ['/api/data-status', '/api/library-analysis/status', '/api/version'])
    for (const path of PUBLIC_API_PATHS) {
      assert.equal(await checkApiAccess(path, null, getKey), 'public')
    }
  })

  it('denies data routes without a token, including near-miss paths', async () => {
    for (const path of ['/api/actors', '/api/documents/abc', '/api/version/extra', '/api/versionX', '/api/data-status/../actors']) {
      assert.equal(await checkApiAccess(path, null, getKey), 'denied', path)
    }
  })

  it('accepts a token signed by Access for this application', async () => {
    assert.equal(await checkApiAccess('/api/actors', await token(), getKey), 'verified')
  })

  it('rejects tokens for another application, issuer, key or time', async () => {
    const bad = {
      audience: await token({ aud: 'another-application' }),
      issuer: await token({ iss: 'https://someone-else.cloudflareaccess.com' }),
      key: await token({ key: otherKey }),
      expired: await token({ exp: Math.floor(Date.now() / 1000) - 60 }),
      garbage: 'not-a-jwt',
    }
    for (const [name, value] of Object.entries(bad)) {
      assert.equal(await checkApiAccess('/api/actors', value, getKey), 'denied', name)
    }
  })

  it('runs the proxy on every API route and enforces it only in production builds', () => {
    const proxy = readFileSync('src/proxy.ts', 'utf8')
    assert.match(proxy, /matcher: '\/api\/:path\*'/)
    assert.match(proxy, /process\.env\.NODE_ENV !== 'production'/)
    assert.match(proxy, /cf-access-jwt-assertion/)
  })
})
