import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { describeFreshness } from '../../src/lib/data-scope'

test('generated time cannot be presented as source freshness', () => {
  const label = describeFreshness(null, { generatedAt: '2026-04-21' })
  assert.match(label, /byggetid, ikke kildeferskhet/)
  assert.doesNotMatch(label, /sist kontrollert 2026-04-21/)
})

test('current policy facts retain the dated primary-source check warning', () => {
  const label = describeFreshness('2026-04-29', { requiresCurrentCheck: true })
  assert.match(label, /sist kontrollert 2026-04-29/)
  assert.match(label, /må kontrolleres mot primærkildene/)
})

test('audited pages keep missing observations and curated samples bounded', () => {
  const circularity = readFileSync('src/app/sirkularitet/SirkularitetContent.tsx', 'utf8')
  const aquaculture = readFileSync('src/app/havbruk/HavbrukContent.tsx', 'utf8')
  const media = readFileSync('src/app/media/page.tsx', 'utf8')

  assert.doesNotMatch(circularity, /Tomme celler = uutnyttede muligheter/)
  assert.match(circularity, /manglende kartlegging/)
  assert.match(aquaculture, /ikke hele norsk havbruk/)
  assert.match(aquaculture, /MTB er tillatt kapasitet, ikke faktisk biomasse/)
  assert.doesNotMatch(aquaculture, /gir få beslutningspunkter over norsk havbruk/)
  assert.match(media, /ikke et representativt mediepanel/)
})
