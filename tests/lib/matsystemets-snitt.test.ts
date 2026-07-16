import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, it } from 'node:test'
import { MatsystemetsSnitt } from '../../src/components/system/MatsystemetsSnitt'
import {
  MATSYSTEM_SNITT_LAYER_IDS,
  MATSYSTEM_SNITT_STAGE_IDS,
  matsystemSnittStages,
  matsystemSnittTopologyNote,
} from '../../src/lib/data/matsystem-snitt'

describe('Matsystemets snitt', () => {
  it('keeps a unique, ordered seven-stage topology with real app routes', () => {
    assert.deepEqual(matsystemSnittStages.map(stage => stage.id), MATSYSTEM_SNITT_STAGE_IDS)
    assert.deepEqual(matsystemSnittStages.map(stage => stage.order), [1, 2, 3, 4, 5, 6, 7])
    assert.equal(new Set(matsystemSnittStages.map(stage => stage.id)).size, 7)

    for (const stage of matsystemSnittStages) {
      assert.ok(stage.label && stage.shortLabel && stage.question)
      assert.match(stage.href, /^\//)
      const route = stage.href.split('?')[0]
      assert.ok(
        route === '/'
          ? existsSync('src/app/page.tsx')
          : existsSync(`src/app${route}/page.tsx`),
        `missing app route for ${stage.id}: ${stage.href}`,
      )
      assert.deepEqual(Object.keys(stage.signals), [...MATSYSTEM_SNITT_LAYER_IDS])
    }
  })

  it('requires sourced evidence for every non-illustrative available signal', () => {
    for (const stage of matsystemSnittStages) {
      for (const signal of Object.values(stage.signals)) {
        if (signal.state === 'gap') {
          assert.ok(signal.gap.neededData.length > 0)
          assert.ok(signal.gap.nextCheck.length > 0)
          continue
        }
        if (signal.evidence.status !== 'illustrative') {
          assert.ok(signal.evidence.sourceRefs.length > 0, `${stage.id}/${signal.title} needs sources`)
        }
        for (const source of signal.evidence.sourceRefs) {
          assert.ok(source.citationReadiness)
          assert.ok(source.note)
        }
      }
    }
  })

  it('renders an accessible ordered map with links and permanent claim boundary', () => {
    const html = renderToStaticMarkup(React.createElement(MatsystemetsSnitt))

    assert.match(html, /<section[^>]+aria-labelledby="matsystem-snitt-title"/)
    assert.match(html, /<ol[^>]+aria-label="Matsystemets sju funksjonelle ledd"/)
    assert.equal((html.match(/<li/g) ?? []).length >= 7, true)
    assert.equal((html.match(/<a /g) ?? []).length, 7)
    assert.equal((html.match(/aria-pressed=/g) ?? []).length, MATSYSTEM_SNITT_LAYER_IDS.length)
    assert.match(html, /Illustrativ systemmodell/)
    assert.ok(html.includes(matsystemSnittTopologyNote))
    assert.doesNotMatch(html, /målt massebalanse|validert eksternt|pilotklar/i)
  })
})
