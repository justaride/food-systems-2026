import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'

import Field08PilotPage, { metadata } from '../../src/app/piloter/field08/page'

describe('/piloter/field08', () => {
  it('is explicitly noindex and nofollow', () => {
    assert.deepEqual(metadata.robots, { index: false, follow: false })
  })

  it('renders the internal status, five provenance cards, blockers, and do-not-say rules', () => {
    const html = renderToStaticMarkup(Field08PilotPage())
    assert.match(html, /Intern innsiktspilot/)
    assert.match(html, /Eiergjennomgang fullført – kun internt/)
    assert.equal((html.match(/data-field08-source-card=/g) ?? []).length, 5)
    assert.match(html, /Blokkerte sammenligninger/)
    assert.match(html, /Ikke si/)
    assert.match(html, /Ekstern bruk er blokkert/)
    assert.match(html, /fs:source:field08\.eu\.eurostat/)
  })

  it('does not render private archive paths or PDF content', () => {
    const html = renderToStaticMarkup(Field08PilotPage())
    assert.doesNotMatch(html, /\.private-archive|BigBrain_StorageBox|file:\/\/|%PDF-|research\/evidence-pack/i)
  })
})
