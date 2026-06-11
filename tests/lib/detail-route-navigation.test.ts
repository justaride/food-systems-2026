import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

test('shared breadcrumbs are available and used by every current detail route surface', () => {
  const breadcrumbs = read('src/components/ui/Breadcrumbs.tsx')
  assert.match(breadcrumbs, /export function Breadcrumbs/)
  assert.match(breadcrumbs, /aria-label="Brødsmuler"/)
  assert.match(breadcrumbs, /aria-current=\{isCurrent \? 'page' : undefined\}/)

  const detailSurfaces = [
    'src/app/selskap/[id]/page.tsx',
    'src/app/aktorer/[slug]/page.tsx',
    'src/app/eierskap/[slug]/page.tsx',
    'src/app/personer/[personKey]/page.tsx',
    'src/app/bibliotek/[...slug]/page.tsx',
    'src/app/kart/[country]/page.tsx',
    'src/app/kart/[country]/flow/page.tsx',
    'src/app/hvitbok/[chapter]/page.tsx',
    'src/app/hvitbok/proveniens/page.tsx',
    'src/app/rapporter/nordisk-sirkularitetsrapport-2026-05/page.tsx',
    'src/app/metodikk/prompts/PromptsContent.tsx',
  ]

  for (const path of detailSurfaces) {
    const source = read(path)
    assert.match(source, /Breadcrumbs/, `${path} should render the shared Breadcrumbs component`)
  }
})

test('detail routes with relationship data expose compact related handoffs', () => {
  const relatedLinks = read('src/components/ui/RelatedLinks.tsx')
  assert.match(relatedLinks, /export function RelatedLinks/)
  assert.match(relatedLinks, /Relatert/)

  const company = read('src/app/selskap/[id]/page.tsx')
  assert.match(company, /RelatedLinks/)
  assert.match(company, /\/eierskap\/\$\{konsernSlug\}/)
  assert.match(company, /\/personer\/\$\{m\.personKey\}/)

  const ownership = read('src/app/eierskap/[slug]/page.tsx')
  assert.match(ownership, /RelatedLinks/)
  assert.match(ownership, /\/selskap\/\$\{dossier\.root\.id\}/)
  assert.match(ownership, /\/personer\/\$\{member\.personKey\}/)

  const person = read('src/app/personer/[personKey]/page.tsx')
  assert.match(person, /RelatedLinks/)
  assert.match(person, /\/selskap\/\$\{role\.companyId\}/)

  const actor = read('src/app/aktorer/[slug]/page.tsx')
  assert.match(actor, /RelatedLinks/)
  assert.match(actor, /\/selskap\/\$\{actor\.company\.id\}/)

  const document = read('src/app/bibliotek/[...slug]/page.tsx')
  assert.match(document, /RelatedLinks/)
  assert.match(document, /\/selskap\/\$\{ref\.company\.id\}/)
  assert.match(document, /\/aktorer\/\$\{ref\.actor\.slug\}/)
})
