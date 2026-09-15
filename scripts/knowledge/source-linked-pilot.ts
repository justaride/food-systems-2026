import { createHash, randomUUID } from 'node:crypto'
import {
  existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync,
  renameSync, rmSync, writeFileSync,
} from 'node:fs'
import { join, resolve } from 'node:path'

export type PilotSource = {
  id: string; title: string; publisher: string; url: string; publishedAt: string | null
  sourceClass: 'primary' | 'synthesis'; verificationStatus: 'unverified'; citationText: string
  accessedAt: string; recheckAfter: string; access: 'opened' | 'blocked' | 'withdrawn'
  rawContentSha256: null; archiveStatus: 'not_captured'; note: string
}
export type PilotEvidence = {
  id: string; sourceId: string; kind: 'observation' | 'target' | 'contract' | 'context'
  geography: string; period: string; unit: string; locator: string
  values: Record<string, number | null>; note: string
}
export type PilotClaim = {
  id: string; status: 'candidate' | 'historical' | 'disputed'
  kind: 'source_report' | 'calculation' | 'inference'; text: string
  evidence: { id: string; digest: string }[]; dependsOn: string[]; limits: string
  calculation?: { kind: 'concentration'; evidenceId: string }
}
export type PilotGap = {
  id: string; question: string; missing: string; route: 'source_lookup' | 'operator_evidence' | 'method' | 'measurement'
  nextEvidence: string; owner: string | null; searchBoundary: string; checkedAt: string
}
export type PilotTopic = { id: string; title: string; scope: string; claimIds: string[]; gapIds: string[] }
export type PilotQuestion = {
  id: string; question: string; topicId: string; claimIds: string[]; gapIds: string[]
  requirements: { evidenceId: string; kind: PilotEvidence['kind']; period: string }[]
}
export type PilotInput = {
  version: 1; status: 'internal_candidate'; humanVerified: false; canonicalPromoted: false
  publicationApproved: false; coveragePromoted: false
  sources: PilotSource[]; evidence: PilotEvidence[]; claims: PilotClaim[]
  gaps: PilotGap[]; topics: PilotTopic[]; questions: PilotQuestion[]
}
type ResolvedClaim = {
  id: string; kind: PilotClaim['kind']; state: 'candidate_linked' | 'blocked' | 'stale' | 'historical'
  text: string | null; limits: string; reasons: string[]; evidenceIds: string[]
}
export type PilotBundle = {
  generator: 'source-linked-pilot/1'; status: 'internal_candidate'; releaseId: string
  inputHash: string; compilerHash: string; asOf: string; input: PilotInput
  claims: ResolvedClaim[]; pages: Record<string, string>
}
const ID = /^[a-z0-9][a-z0-9._-]*$/
const HASH = /^[a-f0-9]{64}$/
const BEGIN = '<!-- BEGIN COMPILED:fs-wiki-v1 -->'
const END = '<!-- END COMPILED:fs-wiki-v1 -->'
const stop = (message: string): never => { throw new Error(message) }
const ensure = (ok: unknown, message: string) => { if (!ok) stop(message) }
const serialise = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(serialise).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => `${JSON.stringify(k)}:${serialise(v)}`).join(',')}}`
  return JSON.stringify(value)
}
export const digest = (value: unknown) => createHash('sha256').update(serialise(value)).digest('hex')
const text = (v: unknown) => typeof v === 'string' && v.trim().length > 0
function date(v: unknown): asserts v is string {
  ensure(typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v), 'invalid date')
  const d = new Date(`${v}T00:00:00Z`)
  ensure(Number.isFinite(d.valueOf()) && d.toISOString().slice(0, 10) === v, 'invalid date')
}
function keys(value: unknown, required: string[], optional: string[] = []) {
  ensure(value && typeof value === 'object' && !Array.isArray(value), 'expected object')
  const actual = Object.keys(value as object)
  ensure(required.every(k => actual.includes(k)), 'missing required field')
  ensure(actual.every(k => [...required, ...optional].includes(k)), 'unknown field; authority changes are not allowed')
}
const unique = <T extends { id: string }>(rows: T[]) => {
  ensure(Array.isArray(rows), 'expected array')
  for (const r of rows) ensure(r && typeof r.id === 'string' && ID.test(r.id), 'invalid identifier')
  ensure(new Set(rows.map(r => r.id)).size === rows.length, 'duplicate identifier')
  return new Map(rows.map(r => [r.id, r]))
}
const stringIds = (value: unknown) => ensure(Array.isArray(value) && value.every(x => typeof x === 'string' && ID.test(x)) && new Set(value).size === value.length, 'invalid identifier list')
export function evidenceDigest(input: PilotInput, id: string): string {
  const e = input.evidence.find(x => x.id === id)
  ensure(e, `missing evidence ${id}`)
  const s = input.sources.find(x => x.id === e!.sourceId)
  ensure(s, `missing source for ${id}`)
  return digest({ source: s, evidence: e })
}
function validate(input: PilotInput, asOf: string, compilerHash: string) {
  keys(input, ['version', 'status', 'humanVerified', 'canonicalPromoted', 'publicationApproved', 'coveragePromoted', 'sources', 'evidence', 'claims', 'gaps', 'topics', 'questions'])
  ensure(input.version === 1 && input.status === 'internal_candidate' && ['humanVerified', 'canonicalPromoted', 'publicationApproved', 'coveragePromoted'].every(k => input[k as keyof PilotInput] === false), 'authority: pilot cannot promote knowledge')
  date(asOf); ensure(HASH.test(compilerHash), 'invalid compiler hash')
  const sources = unique(input.sources), evidence = unique(input.evidence), claims = unique(input.claims)
  const gaps = unique(input.gaps), topics = unique(input.topics); unique(input.questions)
  for (const s of input.sources) {
    keys(s, ['id', 'title', 'publisher', 'url', 'publishedAt', 'sourceClass', 'verificationStatus', 'citationText', 'accessedAt', 'recheckAfter', 'access', 'rawContentSha256', 'archiveStatus', 'note'])
    ensure([s.title, s.publisher, s.url, s.note, s.citationText].every(text), 'missing source metadata')
    ensure(['primary', 'synthesis'].includes(s.sourceClass) && s.verificationStatus === 'unverified', 'authority: invalid source status')
    let url: URL
    try { url = new URL(s.url) } catch { stop('invalid URL') }
    ensure(url!.protocol === 'https:' && !url!.username && !url!.password, 'unsafe URL')
    date(s.accessedAt); date(s.recheckAfter); if (s.publishedAt !== null) date(s.publishedAt)
    ensure(s.accessedAt <= asOf && (s.publishedAt === null || s.publishedAt <= asOf), 'future access or publication date')
    ensure(s.recheckAfter >= s.accessedAt, 'invalid review date')
    ensure(['opened', 'blocked', 'withdrawn'].includes(s.access), 'invalid access state')
    ensure(s.rawContentSha256 === null && s.archiveStatus === 'not_captured', 'authority: no raw archive is established by this pilot')
  }
  for (const e of input.evidence) {
    keys(e, ['id', 'sourceId', 'kind', 'geography', 'period', 'unit', 'locator', 'values', 'note'])
    ensure(sources.has(e.sourceId), `missing source ${e.sourceId}`)
    ensure(['observation', 'target', 'contract', 'context'].includes(e.kind), 'invalid evidence kind')
    ensure([e.geography, e.period, e.unit, e.locator, e.note].every(text), 'missing evidence scope or locator')
    ensure(e.values && typeof e.values === 'object' && !Array.isArray(e.values), 'invalid values')
    for (const [k, v] of Object.entries(e.values)) ensure(/^[A-Za-z][A-Za-z0-9_-]*$/.test(k) && (v === null || (typeof v === 'number' && Number.isFinite(v))), 'invalid numeric value')
  }
  for (const c of input.claims) {
    keys(c, ['id', 'status', 'kind', 'text', 'evidence', 'dependsOn', 'limits'], ['calculation'])
    ensure(['candidate', 'historical', 'disputed'].includes(c.status) && ['source_report', 'calculation', 'inference'].includes(c.kind), 'invalid claim state')
    ensure(text(c.text) && text(c.limits), 'missing claim text or limits')
    stringIds(c.dependsOn); ensure(Array.isArray(c.evidence), 'missing evidence bindings')
    ensure(new Set(c.evidence.map(x => x.id)).size === c.evidence.length, 'duplicate evidence binding')
    for (const b of c.evidence) {
      keys(b, ['id', 'digest']); ensure(evidence.has(b.id) && HASH.test(b.digest), `missing evidence or invalid binding ${b.id}`)
    }
    for (const id of c.dependsOn) ensure(claims.has(id), `missing claim ${id}`)
    ensure(c.evidence.length > 0 || (c.kind === 'inference' && c.dependsOn.length > 0), 'claim lacks evidence')
    if (c.kind === 'calculation') {
      ensure(c.calculation, 'missing calculation')
      keys(c.calculation, ['kind', 'evidenceId'])
      ensure(c.calculation!.kind === 'concentration' && c.evidence.some(b => b.id === c.calculation!.evidenceId), 'calculation lacks bound evidence')
    } else ensure(c.calculation === undefined, 'unexpected calculation')
    for (const token of [...c.text.matchAll(/\{\{([^}]+)\}\}/g)].map(m => m[1])) {
      const split = token.lastIndexOf('.')
      const eid = token.slice(0, split), field = token.slice(split + 1)
      const isCalc = c.calculation && ['hhi', 'cr3'].includes(token)
      ensure(isCalc || (field && c.evidence.some(b => b.id === eid) && Object.hasOwn(evidence.get(eid)!.values, field)), `unbound placeholder ${token}`)
    }
    ensure(!c.text.replace(/\{\{[^}]+\}\}/g, '').includes('{{'), 'invalid placeholder')
  }
  const active = new Set<string>(), done = new Set<string>()
  function visit(id: string) {
    ensure(!active.has(id), 'claim dependency cycle')
    if (done.has(id)) return
    active.add(id); claims.get(id)!.dependsOn.forEach(visit); active.delete(id); done.add(id)
  }
  input.claims.forEach(c => visit(c.id))
  for (const g of input.gaps) {
    keys(g, ['id', 'question', 'missing', 'route', 'nextEvidence', 'owner', 'searchBoundary', 'checkedAt'])
    ensure([g.question, g.missing, g.nextEvidence, g.searchBoundary].every(text), 'missing gap boundary')
    ensure(g.owner === null || text(g.owner), 'invalid owner')
    ensure(['source_lookup', 'operator_evidence', 'method', 'measurement'].includes(g.route), 'invalid gap route')
    date(g.checkedAt); ensure(g.checkedAt <= asOf, 'future gap date')
  }
  for (const t of input.topics) {
    keys(t, ['id', 'title', 'scope', 'claimIds', 'gapIds'])
    ensure(text(t.title) && text(t.scope), 'missing topic scope')
    stringIds(t.claimIds); stringIds(t.gapIds)
    ensure(t.claimIds.every(id => claims.has(id)) && t.gapIds.every(id => gaps.has(id)), 'missing topic dependency')
  }
  for (const q of input.questions) {
    keys(q, ['id', 'question', 'topicId', 'claimIds', 'gapIds', 'requirements'])
    ensure(text(q.question) && topics.has(q.topicId), 'missing question topic')
    stringIds(q.claimIds); stringIds(q.gapIds)
    ensure(q.claimIds.every(id => topics.get(q.topicId)!.claimIds.includes(id)) && q.gapIds.every(id => topics.get(q.topicId)!.gapIds.includes(id)), 'missing question dependency')
    ensure(Array.isArray(q.requirements), 'invalid question requirements')
    const linkedEvidence = new Set<string>(), seenClaims = new Set<string>()
    function collect(id: string) {
      if (seenClaims.has(id)) return
      seenClaims.add(id)
      const c = claims.get(id)!
      c.evidence.forEach(e => linkedEvidence.add(e.id))
      c.dependsOn.forEach(collect)
    }
    q.claimIds.forEach(collect)
    for (const r of q.requirements) {
      keys(r, ['evidenceId', 'kind', 'period'])
      ensure(linkedEvidence.has(r.evidenceId) && ['observation', 'target', 'contract', 'context'].includes(r.kind) && text(r.period), 'invalid or unrelated evidence requirement')
    }
  }
}
export function compilePilot(input: PilotInput, asOf: string, compilerHash: string): PilotBundle {
  validate(input, asOf, compilerHash)
  const resolved = new Map<string, ResolvedClaim>()
  function resolveClaim(id: string): ResolvedClaim {
    if (resolved.has(id)) return resolved.get(id)!
    const c = input.claims.find(x => x.id === id)!
    const parents = c.dependsOn.map(resolveClaim)
    const reasons: string[] = [], values: Record<string, number> = {}
    let stale = false
    for (const binding of c.evidence) {
      const e = input.evidence.find(x => x.id === binding.id)!, s = input.sources.find(x => x.id === e.sourceId)!
      if (binding.digest !== evidenceDigest(input, e.id)) reasons.push(`Changed evidence binding: ${e.id}; candidate reconciliation required`)
      if (s.access !== 'opened') reasons.push(`Source ${s.id} is ${s.access}`)
      if (s.recheckAfter < asOf) stale = true
      for (const [k, v] of Object.entries(e.values)) if (v !== null) values[`${e.id}.${k}`] = v
    }
    if (c.calculation) {
      const e = input.evidence.find(x => x.id === c.calculation!.evidenceId)!
      const shares = Object.values(e.values), numbers = shares.filter((v): v is number => v !== null)
      if (e.kind !== 'observation' || e.unit !== 'percent_revenue_share' || shares.length < 3 || numbers.length !== shares.length || numbers.some(x => x < 0 || x > 100) || Math.abs(numbers.reduce((a, b) => a + b, 0) - 100) > 0.5) {
        reasons.push('Concentration requires complete, rounded revenue-share observations summing approximately to 100')
      } else {
        values.hhi = Math.round(numbers.reduce((a, b) => a + b * b, 0))
        values.cr3 = Number([...numbers].sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b, 0).toFixed(1))
      }
    }
    for (const p of parents) {
      if (p.state === 'stale') stale = true
      else if (p.state !== 'candidate_linked') reasons.push(`Dependency ${p.id} is ${p.state}`)
    }
    if (c.status === 'disputed') reasons.push('Disputed claim; not usable as an answer')
    let rendered = c.text.replace(/\{\{([^}]+)\}\}/g, (_, k: string) => {
      if (!Object.hasOwn(values, k)) { reasons.push(`Unknown value: ${k}`); return '[unknown]' }
      return String(values[k])
    })
    const state: ResolvedClaim['state'] = c.status === 'historical' ? 'historical' : reasons.length ? 'blocked' : stale ? 'stale' : 'candidate_linked'
    if (state !== 'candidate_linked') rendered = ''
    const result: ResolvedClaim = { id, kind: c.kind, state, text: rendered || null, limits: c.limits,
      reasons: [...reasons, ...(stale ? ['Pilot review deadline passed; this is not proof the fact is false'] : [])],
      evidenceIds: [...new Set([...c.evidence.map(b => b.id), ...parents.flatMap(p => p.evidenceIds)])].sort() }
    resolved.set(id, result); return result
  }
  const inputHash = digest(input), releaseId = digest({ generator: 'source-linked-pilot/1', inputHash, compilerHash, asOf })
  const bundle: PilotBundle = { generator: 'source-linked-pilot/1', status: 'internal_candidate', releaseId, inputHash, compilerHash, asOf, input: structuredClone(input), claims: input.claims.map(c => resolveClaim(c.id)), pages: {} }
  for (const t of input.topics) {
    const parts = [BEGIN, `# ${t.title}`, `As of: ${asOf}. Internal candidate preview — not reviewed, canonical, or approved for external use.`,
      `## Scope\n\n${t.scope}`, '## Evidence-linked explanation']
    for (const id of t.claimIds) {
      const c = resolved.get(id)!
      parts.push(`### ${id} · ${c.kind} · ${c.state}`, c.text ?? `Answer withheld: ${c.reasons.join('; ') || c.state}.`, `Boundary: ${c.limits}`)
      for (const eid of c.evidenceIds) {
        const e = input.evidence.find(x => x.id === eid)!, s = input.sources.find(x => x.id === e.sourceId)!
        parts.push(`${c.kind === 'inference' ? 'Premise source' : 'Source'} [${s.publisher}: ${s.title}](${s.url}) — ${e.locator}. ${e.kind}; ${e.geography}; period ${e.period}; unit ${e.unit}. Access ${s.accessedAt}: ${s.access}. Evidence ID: ${eid}.`)
      }
    }
    parts.push('## What remains unknown')
    for (const id of t.gapIds) {
      const g = input.gaps.find(x => x.id === id)!
      parts.push(`### ${id}: ${g.question}`, g.missing, `Next evidence: ${g.nextEvidence}`, `Route: ${g.route}. Owner: ${g.owner ?? 'unassigned'}. Search boundary (${g.checkedAt}): ${g.searchBoundary}`)
    }
    parts.push('## Questions this pilot can handle')
    for (const q of input.questions.filter(x => x.topicId === t.id)) {
      const answer = questionAnswer(bundle, q.id, 'internal')
      parts.push(`**${q.id} — ${q.question}**\n\nStatus: ${answer.status}. ${answer.reasons.join(' ')}`)
    }
    parts.push('## Provenance and authority', 'Evidence digests bind project-authored extraction and metadata, NOT original source bytes. Raw archival capture, full-text processing, human review, database promotion, coverage promotion and publication are not established by this preview.', `Release: ${releaseId}`, END)
    bundle.pages[`${t.id}.md`] = `${parts.join('\n\n')}\n`
  }
  return bundle
}
export function questionAnswer(bundle: PilotBundle, id: string, audience: 'internal' | 'external') {
  const empty = { questionId: id, status: 'unknown', reasons: [] as string[], claims: [] as ResolvedClaim[], gaps: [] as PilotGap[] }
  if (audience !== 'internal') return { ...empty, status: 'blocked', reasons: ['External use is not authorised by this candidate-only pilot.'] }
  const q = bundle.input.questions.find(x => x.id === id)
  if (!q) return { ...empty, reasons: ['Question is outside the registered pilot; no answer inferred.'] }
  const claims = q.claimIds.map(cid => bundle.claims.find(c => c.id === cid)!)
  const gaps = q.gapIds.map(gid => bundle.input.gaps.find(g => g.id === gid)!)
  const mismatch = q.requirements.filter(r => {
    const e = bundle.input.evidence.find(x => x.id === r.evidenceId)!
    return e.kind !== r.kind || e.period !== r.period
  })
  if (mismatch.length) return { ...empty, gaps, reasons: mismatch.map(r => `No compatible ${r.kind} for period ${r.period}; ${r.evidenceId} has a different kind or period.`) }
  if (claims.some(c => c.state !== 'candidate_linked')) return { ...empty, status: 'blocked', gaps, reasons: claims.filter(c => c.state !== 'candidate_linked').map(c => `${c.id}: ${c.state}; ${c.reasons.join('; ')}`) }
  return { ...empty, status: !claims.length ? 'unknown' : gaps.length ? 'partial' : 'candidate_linked', claims, gaps,
    reasons: !claims.length ? ['No supported answer is registered; see the bounded evidence gaps.'] : ['Candidate explanation only; formal review remains open.'] }
}
export function planImpact(before: PilotInput, after: PilotInput) {
  const changedEvidence = new Set([...before.evidence, ...after.evidence].map(e => e.id).filter(id => {
    try { return evidenceDigest(before, id) !== evidenceDigest(after, id) } catch { return true }
  }))
  const allClaims = [...before.claims, ...after.claims], changedClaims = new Set<string>()
  for (const c of allClaims) if (c.evidence.some(e => changedEvidence.has(e.id)) || digest(before.claims.find(x => x.id === c.id) ?? null) !== digest(after.claims.find(x => x.id === c.id) ?? null)) changedClaims.add(c.id)
  let count = -1
  while (count !== changedClaims.size) { count = changedClaims.size; allClaims.forEach(c => { if (c.dependsOn.some(id => changedClaims.has(id))) changedClaims.add(c.id) }) }
  const changedGaps = new Set([...before.gaps, ...after.gaps].filter(g => digest(before.gaps.find(x => x.id === g.id) ?? null) !== digest(after.gaps.find(x => x.id === g.id) ?? null)).map(g => g.id))
  const topicIds = [...new Set([...before.topics, ...after.topics].filter(t => t.claimIds.some(id => changedClaims.has(id)) || t.gapIds.some(id => changedGaps.has(id)) || digest(before.topics.find(x => x.id === t.id) ?? null) !== digest(after.topics.find(x => x.id === t.id) ?? null)).map(t => t.id))].sort()
  return { evidenceIds: [...changedEvidence].sort(), claimIds: [...changedClaims].sort(), topicIds,
    questionIds: [...new Set([...before.questions, ...after.questions].filter(q => q.claimIds.some(id => changedClaims.has(id)) || q.gapIds.some(id => changedGaps.has(id)) || topicIds.includes(q.topicId) || digest(before.questions.find(x => x.id === q.id) ?? null) !== digest(after.questions.find(x => x.id === q.id) ?? null)).map(q => q.id))].sort() }
}
function releaseFiles(bundle: PilotBundle): Record<string, string> {
  const snapshot = { generator: bundle.generator, status: bundle.status, releaseId: bundle.releaseId,
    inputHash: bundle.inputHash, compilerHash: bundle.compilerHash, asOf: bundle.asOf, input: bundle.input }
  return { ...bundle.pages, 'bundle.json': `${serialise(snapshot)}\n` }
}
function verifyRelease(root: string, bundle: PilotBundle) {
  const dir = join(root, 'releases', bundle.releaseId), files = releaseFiles(bundle)
  ensure(!lstatSync(dir).isSymbolicLink(), 'integrity: release symlink')
  ensure(serialise(readdirSync(dir).sort()) === serialise(Object.keys(files).sort()), 'integrity: release file set mismatch')
  for (const [name, content] of Object.entries(files)) ensure(!lstatSync(join(dir, name)).isSymbolicLink() && readFileSync(join(dir, name), 'utf8') === content, `integrity: ${name} mismatch`)
}
export function writeRelease(root: string, bundle: PilotBundle) {
  ensure(HASH.test(bundle.releaseId), 'invalid release identifier')
  ensure(serialise(compilePilot(bundle.input, bundle.asOf, bundle.compilerHash)) === serialise(bundle), 'integrity: bundle does not reproduce')
  const releases = join(root, 'releases'); mkdirSync(releases, { recursive: true })
  const dest = join(releases, bundle.releaseId)
  if (existsSync(dest)) verifyRelease(root, bundle)
  else {
    const stage = mkdtempSync(join(releases, '.stage-'))
    try {
      for (const [name, content] of Object.entries(releaseFiles(bundle))) writeFileSync(join(stage, name), content, { flag: 'wx' })
      renameSync(stage, dest)
    } finally { if (existsSync(stage)) rmSync(stage, { recursive: true, force: true }) }
  }
  const pointer = join(root, `.current-${randomUUID()}.tmp`)
  try { writeFileSync(pointer, `${JSON.stringify({ releaseId: bundle.releaseId })}\n`, { flag: 'wx' }); renameSync(pointer, join(root, 'current.json')) }
  finally { if (existsSync(pointer)) rmSync(pointer) }
}
export function readCurrent(root: string, input: PilotInput, asOf: string, compilerHash: string): PilotBundle {
  const pointer = JSON.parse(readFileSync(join(root, 'current.json'), 'utf8')) as { releaseId: string }
  ensure(HASH.test(pointer.releaseId), 'integrity: invalid release pointer')
  const expected = compilePilot(input, asOf, compilerHash)
  ensure(pointer.releaseId === expected.releaseId, 'stale output: run a dry-run and explicitly write a new candidate release')
  verifyRelease(root, expected); return expected
}
function main() {
  const args = process.argv.slice(2), rootArg = args.find(x => x.startsWith('--root='))
  ensure(args.every(x => ['--write', '--check', '--external'].includes(x) || ['--root=', '--as-of=', '--question='].some(p => x.startsWith(p))), 'unknown argument')
  const root = resolve(rootArg?.slice(7) ?? process.cwd())
  const asOf = args.find(x => x.startsWith('--as-of='))?.slice(8)
  ensure(asOf, 'Specify --as-of=YYYY-MM-DD; no implicit current-date claim')
  ensure([args.includes('--write'), args.includes('--check'), args.some(x => x.startsWith('--question='))].filter(Boolean).length <= 1, 'choose one operation')
  const input = JSON.parse(readFileSync(join(root, 'knowledge/pilots/source-linked-v1/input.v1.json'), 'utf8')) as PilotInput
  const compilerHash = createHash('sha256').update(readFileSync(join(root, 'scripts/knowledge/source-linked-pilot.ts'))).digest('hex')
  const output = join(root, 'knowledge/wiki/pilots/source-linked-v1'), question = args.find(x => x.startsWith('--question='))?.slice(11)
  if (question || args.includes('--check')) {
    const b = readCurrent(output, input, asOf!, compilerHash)
    console.log(JSON.stringify(question ? questionAnswer(b, question, args.includes('--external') ? 'external' : 'internal') : { result: 'PASS', releaseId: b.releaseId, scope: 'candidate pilot only' }, null, 2)); return
  }
  const b = compilePilot(input, asOf!, compilerHash)
  let impact: unknown = { baseline: true, topicIds: input.topics.map(t => t.id) }
  if (existsSync(join(output, 'current.json'))) {
    const previous = JSON.parse(readFileSync(join(output, 'current.json'), 'utf8')) as { releaseId: string }
    ensure(HASH.test(previous.releaseId), 'integrity: invalid previous release')
    const snapshot = JSON.parse(readFileSync(join(output, 'releases', previous.releaseId, 'bundle.json'), 'utf8')) as Omit<PilotBundle, 'claims' | 'pages'>
    // A changed compiler may no longer reproduce old rendering. History stays untouched;
    // integrity of the source snapshot is checked before computing the candidate delta.
    ensure(snapshot.releaseId === previous.releaseId && digest(snapshot.input) === snapshot.inputHash &&
      digest({ generator: snapshot.generator, inputHash: snapshot.inputHash, compilerHash: snapshot.compilerHash, asOf: snapshot.asOf }) === snapshot.releaseId,
    'integrity: previous snapshot mismatch')
    impact = { ...planImpact(snapshot.input, input), compilerChanged: snapshot.compilerHash !== compilerHash, asOfChanged: snapshot.asOf !== asOf }
  }
  if (args.includes('--write')) writeRelease(output, b)
  console.log(JSON.stringify({ operation: args.includes('--write') ? 'candidate_preview_written' : 'dry_run', releaseId: b.releaseId, impact,
    claimStates: b.claims.map(c => ({ id: c.id, state: c.state })), authorityChanged: false }, null, 2))
}
if (process.argv[1] && /(?:^|[\\/])source-linked-pilot\.(?:ts|js)$/.test(process.argv[1])) {
  try { main() } catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1 }
}
