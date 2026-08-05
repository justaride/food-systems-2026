import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const dockerfile = readFileSync('Dockerfile', 'utf8')
describe('production migration runtime', () => {
  it('copies the repository-lockfile dependency tree without an unlocked runtime install', () => {
    assert.match(dockerfile, /COPY --from=deps .*\/app\/node_modules \.\/node_modules/)
    assert.doesNotMatch(dockerfile, /npm install --no-audit/)
  })

  it('ships the Prisma CLI and config in the final runtime image', () => {
    assert.match(dockerfile, /COPY --from=deps .*node_modules \.\/node_modules/)
    assert.match(dockerfile, /COPY --from=builder .*prisma\.config\.ts \.\/prisma\.config\.ts/)
  })

  it('runs migrations before the app and exposes a database-backed healthcheck', () => {
    assert.match(dockerfile, /HEALTHCHECK[\s\S]*\/api\/data-status/)
    assert.match(dockerfile, /CMD \["sh", "-c", "sh \/app\/scripts\/apply-prod-migrations\.sh && unset MIGRATION_DATABASE_URL && exec node server\.js"\]/)
  })

  it('does not accept a database credential as a Docker build argument', () => {
    assert.doesNotMatch(dockerfile, /^ARG DATABASE_URL/m)
  })
})
