import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { validateDownloadBacklogCsv } from '../../src/lib/download-backlog-validation'

const header =
  'priority,status,country,theme,doc_type,institution,title,year,url,url_type,current_local_status,target_path,next_action,source_basis'

describe('download backlog validation', () => {
  it('rejects section headings parsed as CSV rows', () => {
    const result = validateDownloadBacklogCsv(
      `${header}\n# === SECTION ===,,,,,,,,,,,,,\n`,
      'research/evidence-pack/download-backlog-demo.csv',
    )

    assert.equal(result.valid, false)
    assert.equal(result.issues[0].severity, 'error')
    assert.equal(result.issues[0].line, 2)
    assert.match(result.issues[0].message, /section heading/)
  })

  it('rejects unknown status values', () => {
    const result = validateDownloadBacklogCsv(
      `${header}\nP1,vertical farming,NO,theme,report,Inst,Title,2026,https://example.com,landing_html,not_downloaded,research/x.pdf,fetch,seed\n`,
      'research/evidence-pack/download-backlog-demo.csv',
    )

    assert.equal(result.valid, false)
    assert.equal(result.issues[0].severity, 'error')
    assert.equal(result.issues[0].line, 2)
    assert.match(result.issues[0].message, /invalid status/)
  })

  it('rejects active rows without priority or status', () => {
    const result = validateDownloadBacklogCsv(
      `${header}\n,,NO,theme,report,Inst,Title,2026,https://example.com,landing_html,not_downloaded,research/x.pdf,fetch,seed\n`,
      'research/evidence-pack/download-backlog-demo.csv',
    )

    assert.equal(result.valid, false)
    assert.deepEqual(
      result.issues.map(issue => issue.message),
      ['active row missing priority', 'active row missing status'],
    )
  })

  it('reports duplicate URLs and target paths as warnings', () => {
    const result = validateDownloadBacklogCsv(
      `${header}\n` +
        'P1,downloaded,NO,theme,report,Inst,Title A,2026,https://example.com,landing_html,local_md_available,research/x.pdf,fetch,seed\n' +
        'P2,url_only,NO,theme,report,Inst,Title B,2026,https://example.com,landing_html,not_downloaded,research/x.pdf,fetch,seed\n',
      'research/evidence-pack/download-backlog-demo.csv',
    )

    assert.equal(result.valid, true)
    assert.deepEqual(
      result.issues.map(issue => issue.message),
      [
        'duplicate url also appears on line 2: https://example.com',
        'duplicate target_path also appears on line 2: research/x.pdf',
      ],
    )
    assert.ok(result.issues.every(issue => issue.severity === 'warning'))
  })

  it('accepts canonical active rows', () => {
    const result = validateDownloadBacklogCsv(
      `${header}\nP1,url_only,NO,theme,report,Inst,Title,2026,https://example.com,landing_html,not_downloaded,research/x.pdf,fetch,seed\n`,
      'research/evidence-pack/download-backlog-demo.csv',
    )

    assert.equal(result.valid, true)
    assert.deepEqual(result.issues, [])
  })
})
