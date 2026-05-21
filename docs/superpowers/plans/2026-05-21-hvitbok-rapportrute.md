# Hvitbok Report Route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/hvitbok` route — one chapter-divided deliverable document for Food Systems, sourced from markdown files, with placeholder-token embeds (key figures, callouts, live charts, related-visualization cards).

**Architecture:** Chapter prose lives as markdown files in `content/hvitbok/`. A typed chapter registry lists chapters; a loader reads the files; a token parser splits markdown on `{{type:id}}` block tokens; a render layer interleaves `marked`-rendered HTML with React embed components whose content is defined typed in an embed registry. Two statically-generated routes: a table-of-contents page and a chapter detail page.

**Tech Stack:** Next.js (App Router, React server components), TypeScript, Tailwind (`prose`), `marked` for markdown→HTML, `node:test` for tests.

**Spec:** `docs/superpowers/specs/2026-05-21-hvitbok-rapportrute-design.md`

---

## File Structure

- Create `content/hvitbok/01-kort-til-jan-thomas.md` — chapter 1 prose.
- Create `content/hvitbok/02-nordisk-sirkularitet.md` — chapter 2 prose.
- Create `content/hvitbok/03-fokusomraader.md` — chapter 3 prose.
- Create `src/lib/hvitbok/chapters.ts` — `Chapter` type, `chapters` array, `getChapterBySlug`, `getAdjacentChapters`.
- Create `src/lib/hvitbok/loader.ts` — `readChapterMarkdown`, `countChapterWords`.
- Create `src/lib/hvitbok/render-chapter.tsx` — `ChapterSegment` type, `parseChapter` (pure), `renderChapter` (JSX).
- Create `src/lib/hvitbok/embeds.ts` — embed types, `chapterEmbeds`, `getEmbed`, `EMBEDDABLE_CHARTS`.
- Create `src/components/hvitbok/KeyFigureBox.tsx` — key-figure box.
- Create `src/components/hvitbok/CalloutBox.tsx` — callout/quote box.
- Create `src/components/hvitbok/RelatedVisuals.tsx` — related-visualizations card.
- Create `src/components/hvitbok/EmbeddedChart.tsx` — live chart embed.
- Create `src/app/hvitbok/page.tsx` — table-of-contents page.
- Create `src/app/hvitbok/[chapter]/page.tsx` — chapter detail page.
- Modify `src/components/layout/Header.tsx` — add "Hvitbok" nav entry.
- Create `tests/lib/hvitbok-chapters.test.ts`, `tests/lib/hvitbok-loader.test.ts`, `tests/lib/hvitbok-parse.test.ts`, `tests/lib/hvitbok-embeds.test.ts`, `tests/lib/hvitbok-integrity.test.ts`.

**Shared token contract.** These exact `chapterSlug` / `tokenId` / token-type triples are used by both the seed content (Task 2) and the embed registry (Task 6). They must match exactly.

| Chapter slug | Token | Type |
|---|---|---|
| `kort-til-jan-thomas` | `{{nokkeltall:oeko-melk-anvendelse}}` | nokkeltall |
| `kort-til-jan-thomas` | `{{callout:landbruksdir-sitat}}` | callout |
| `kort-til-jan-thomas` | `{{viz:butikk-zipf}}` | viz (live chart) |
| `kort-til-jan-thomas` | `{{relatert:jt-relatert}}` | relatert |
| `nordisk-sirkularitet` | `{{nokkeltall:dk-soya-sporing}}` | nokkeltall |
| `nordisk-sirkularitet` | `{{callout:eudr-frist}}` | callout |
| `nordisk-sirkularitet` | `{{relatert:sirk-relatert}}` | relatert |
| `fokusomraader` | `{{callout:fokus-intro}}` | callout |
| `fokusomraader` | `{{relatert:fokus-relatert}}` | relatert |

---

## Task 1: Install marked and create content directory

**Files:**
- Modify: `package.json` (dependency added by npm)
- Create: `content/hvitbok/.gitkeep`

- [ ] **Step 1: Install marked**

Run: `npm install marked`
Expected: `marked` appears in `package.json` `dependencies`. Modern `marked` ships its own TypeScript types — no `@types/marked` needed.

- [ ] **Step 2: Create the content directory**

Run: `mkdir -p content/hvitbok && touch content/hvitbok/.gitkeep`
Expected: `content/hvitbok/.gitkeep` exists.

- [ ] **Step 3: Verify marked imports**

Run: `node --import=tsx -e "import('marked').then(m => console.log(typeof m.marked))"`
Expected: prints `function`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json content/hvitbok/.gitkeep
git commit -m "chore: add marked dependency and hvitbok content dir"
```

---

## Task 2: Seed chapter markdown files

**Files:**
- Create: `content/hvitbok/01-kort-til-jan-thomas.md`
- Create: `content/hvitbok/02-nordisk-sirkularitet.md`
- Create: `content/hvitbok/03-fokusomraader.md`

These files hold chapter *body* prose only — no frontmatter (metadata lives in `chapters.ts`, Task 3). Block tokens (`{{type:id}}`) sit alone on their own line, surrounded by blank lines.

- [ ] **Step 1: Write chapter 1**

Create `content/hvitbok/01-kort-til-jan-thomas.md` with exactly this content:

```markdown
## Hvorfor dette notatet

Etter samtalen med Jan Thomas har vi samlet de funnene fra plattformen som
oftest overrasker. Dette kapittelet er ment som et raskt «treffer dette /
treffer ikke»-utgangspunkt før transition group går videre.

## Det du neppe forventet

**Norsk øko er en tilbuds-flaskehals, ikke et etterspørselsproblem.**
Landbruksdirektoratet er tydelige på at norsk melkeråvare avkortet leveranser
av økologisk melk gjennom store deler av 2025.

{{callout:landbruksdir-sitat}}

Anvendelsesgraden forteller den samme historien: økologisk melk og egg går
nesten i sin helhet til konsum, mens firfota kjøtt har et betydelig overskudd.

{{nokkeltall:oeko-melk-anvendelse}}

**Strukturen i dagligvaremarkedet er svært konsentrert.** Butikktettheten per
kommune følger en bratt fordeling — noen få aktører dekker det meste.

{{viz:butikk-zipf}}

## Videre lesning

{{relatert:jt-relatert}}
```

- [ ] **Step 2: Write chapter 2**

Create `content/hvitbok/02-nordisk-sirkularitet.md`. Adapt the prose from the existing report `public/reports/nordisk-sirkularitetsrapport-2026-05.html` (open it, extract the soya-traceability and EUDR sections). The chapter MUST contain exactly these three block tokens, each alone on its own line, in this order: `{{nokkeltall:dk-soya-sporing}}`, `{{callout:eudr-frist}}`, `{{relatert:sirk-relatert}}`. Aim for 3-6 short prose sections (`##` headings) around them. No frontmatter.

- [ ] **Step 3: Write chapter 3**

Create `content/hvitbok/03-fokusomraader.md`. Adapt the "5 fokusområder" content from `teaser-jan-thomas-2026-04-30.md` (the focus-area table). The chapter MUST contain exactly these two block tokens, each alone on its own line: `{{callout:fokus-intro}}` near the top, `{{relatert:fokus-relatert}}` at the end. Include the focus-area table as a normal GitHub-flavored markdown table. No frontmatter.

- [ ] **Step 4: Commit**

```bash
git add content/hvitbok/01-kort-til-jan-thomas.md content/hvitbok/02-nordisk-sirkularitet.md content/hvitbok/03-fokusomraader.md
git commit -m "docs: seed hvitbok chapter content"
```

---

## Task 3: Chapter registry

**Files:**
- Create: `src/lib/hvitbok/chapters.ts`
- Test: `tests/lib/hvitbok-chapters.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/hvitbok-chapters.test.ts`:

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  chapters,
  getChapterBySlug,
  getAdjacentChapters,
} from '../../src/lib/hvitbok/chapters'

describe('hvitbok chapter registry', () => {
  it('has unique, non-empty slugs', () => {
    const slugs = chapters.map((c) => c.slug)
    assert.equal(slugs.length, new Set(slugs).size)
    assert.ok(slugs.every((s) => s.length > 0))
  })

  it('resolves a chapter by slug', () => {
    const ch = getChapterBySlug('kort-til-jan-thomas')
    assert.ok(ch)
    assert.equal(ch?.title, 'Kort til Jan Thomas')
  })

  it('returns undefined for an unknown slug', () => {
    assert.equal(getChapterBySlug('finnes-ikke'), undefined)
  })

  it('returns adjacent chapters by reading order', () => {
    const first = chapters[0]
    const second = chapters[1]
    assert.equal(getAdjacentChapters(first.slug).prev, undefined)
    assert.equal(getAdjacentChapters(first.slug).next?.slug, second.slug)
    assert.equal(getAdjacentChapters(second.slug).prev?.slug, first.slug)
  })

  it('returns no next chapter for the last chapter', () => {
    const last = chapters[chapters.length - 1]
    assert.equal(getAdjacentChapters(last.slug).next, undefined)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import=tsx --test tests/lib/hvitbok-chapters.test.ts`
Expected: FAIL — cannot find module `../../src/lib/hvitbok/chapters`.

- [ ] **Step 3: Write the registry**

Create `src/lib/hvitbok/chapters.ts`:

```ts
export type Chapter = {
  slug: string
  number: string
  title: string
  subtitle?: string
  filePath: string
  audience?: string
  status?: string
}

export const chapters: Chapter[] = [
  {
    slug: 'kort-til-jan-thomas',
    number: '1',
    title: 'Kort til Jan Thomas',
    subtitle: 'De funnene som oftest overrasker',
    filePath: 'content/hvitbok/01-kort-til-jan-thomas.md',
    audience: 'Jan Thomas, transition group',
    status: 'Utkast',
  },
  {
    slug: 'nordisk-sirkularitet',
    number: '2',
    title: 'Nordisk sirkularitet',
    subtitle: 'Sporbarhet og EUDR-asymmetri',
    filePath: 'content/hvitbok/02-nordisk-sirkularitet.md',
    audience: 'Transition group',
    status: 'Utkast',
  },
  {
    slug: 'fokusomraader',
    number: '3',
    title: 'Fokusområder',
    subtitle: 'Fem foreslåtte satsinger',
    filePath: 'content/hvitbok/03-fokusomraader.md',
    audience: 'Transition group',
    status: 'Utkast',
  },
]

export function getChapterBySlug(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug)
}

export function getAdjacentChapters(slug: string): {
  prev?: Chapter
  next?: Chapter
} {
  const i = chapters.findIndex((c) => c.slug === slug)
  if (i === -1) return {}
  return {
    prev: i > 0 ? chapters[i - 1] : undefined,
    next: i < chapters.length - 1 ? chapters[i + 1] : undefined,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import=tsx --test tests/lib/hvitbok-chapters.test.ts`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/hvitbok/chapters.ts tests/lib/hvitbok-chapters.test.ts
git commit -m "feat: add hvitbok chapter registry"
```

---

## Task 4: Markdown loader

**Files:**
- Create: `src/lib/hvitbok/loader.ts`
- Test: `tests/lib/hvitbok-loader.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/hvitbok-loader.test.ts`:

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readChapterMarkdown, countChapterWords } from '../../src/lib/hvitbok/loader'

describe('hvitbok markdown loader', () => {
  it('reads a chapter markdown file relative to project root', () => {
    const md = readChapterMarkdown('content/hvitbok/01-kort-til-jan-thomas.md')
    assert.ok(md.includes('Hvorfor dette notatet'))
  })

  it('counts words in a chapter', () => {
    const count = countChapterWords('content/hvitbok/01-kort-til-jan-thomas.md')
    assert.ok(count > 20)
  })

  it('throws for a missing file', () => {
    assert.throws(() => readChapterMarkdown('content/hvitbok/finnes-ikke.md'))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import=tsx --test tests/lib/hvitbok-loader.test.ts`
Expected: FAIL — cannot find module `../../src/lib/hvitbok/loader`.

- [ ] **Step 3: Write the loader**

Create `src/lib/hvitbok/loader.ts`:

```ts
import fs from 'node:fs'
import path from 'node:path'

const PROJECT_ROOT = process.cwd()

export function readChapterMarkdown(filePath: string): string {
  return fs.readFileSync(path.join(PROJECT_ROOT, filePath), 'utf-8')
}

export function countChapterWords(filePath: string): number {
  const text = readChapterMarkdown(filePath)
  return text.split(/\s+/).filter(Boolean).length
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import=tsx --test tests/lib/hvitbok-loader.test.ts`
Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/hvitbok/loader.ts tests/lib/hvitbok-loader.test.ts
git commit -m "feat: add hvitbok markdown loader"
```

---

## Task 5: Token parser

**Files:**
- Create: `src/lib/hvitbok/render-chapter.tsx` (parser portion only this task)
- Test: `tests/lib/hvitbok-parse.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/hvitbok-parse.test.ts`:

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseChapter } from '../../src/lib/hvitbok/render-chapter'

describe('hvitbok token parser', () => {
  it('returns a single markdown segment when there are no tokens', () => {
    const segs = parseChapter('# Hei\n\nVanlig avsnitt.')
    assert.equal(segs.length, 1)
    assert.equal(segs[0].kind, 'markdown')
  })

  it('splits a block token onto its own segment', () => {
    const segs = parseChapter('Foran.\n\n{{nokkeltall:tall-1}}\n\nEtter.')
    assert.equal(segs.length, 3)
    assert.equal(segs[0].kind, 'markdown')
    assert.deepEqual(segs[1], {
      kind: 'token',
      tokenType: 'nokkeltall',
      tokenId: 'tall-1',
    })
    assert.equal(segs[2].kind, 'markdown')
  })

  it('treats a token inside a paragraph as literal text, not a token', () => {
    const segs = parseChapter('Se {{viz:graf-1}} her.')
    assert.equal(segs.length, 1)
    assert.equal(segs[0].kind, 'markdown')
  })

  it('parses consecutive block tokens', () => {
    const segs = parseChapter('{{callout:a}}\n\n{{relatert:b}}')
    assert.equal(segs.filter((s) => s.kind === 'token').length, 2)
  })

  it('returns an empty array for empty input', () => {
    assert.deepEqual(parseChapter(''), [])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import=tsx --test tests/lib/hvitbok-parse.test.ts`
Expected: FAIL — cannot find module `../../src/lib/hvitbok/render-chapter`.

- [ ] **Step 3: Write the parser**

Create `src/lib/hvitbok/render-chapter.tsx` with the parser (the `renderChapter` JSX function is added in Task 8):

```tsx
export type ChapterSegment =
  | { kind: 'markdown'; content: string }
  | { kind: 'token'; tokenType: string; tokenId: string }

const TOKEN_LINE = /^\{\{([a-z]+):([a-z0-9-]+)\}\}$/

export function parseChapter(markdown: string): ChapterSegment[] {
  if (markdown.trim() === '') return []

  const segments: ChapterSegment[] = []
  let buffer: string[] = []

  const flush = () => {
    const content = buffer.join('\n').trim()
    if (content !== '') segments.push({ kind: 'markdown', content })
    buffer = []
  }

  for (const line of markdown.split('\n')) {
    const match = line.trim().match(TOKEN_LINE)
    if (match) {
      flush()
      segments.push({
        kind: 'token',
        tokenType: match[1],
        tokenId: match[2],
      })
    } else {
      buffer.push(line)
    }
  }
  flush()
  return segments
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import=tsx --test tests/lib/hvitbok-parse.test.ts`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/hvitbok/render-chapter.tsx tests/lib/hvitbok-parse.test.ts
git commit -m "feat: add hvitbok token parser"
```

---

## Task 6: Embed registry

**Files:**
- Create: `src/lib/hvitbok/embeds.ts`
- Test: `tests/lib/hvitbok-embeds.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/hvitbok-embeds.test.ts`:

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  getEmbed,
  EMBEDDABLE_CHARTS,
} from '../../src/lib/hvitbok/embeds'

describe('hvitbok embed registry', () => {
  it('resolves a key-figure embed', () => {
    const e = getEmbed('kort-til-jan-thomas', 'oeko-melk-anvendelse')
    assert.equal(e?.kind, 'nokkeltall')
  })

  it('resolves a callout embed', () => {
    const e = getEmbed('kort-til-jan-thomas', 'landbruksdir-sitat')
    assert.equal(e?.kind, 'callout')
  })

  it('returns undefined for an unknown embed', () => {
    assert.equal(getEmbed('kort-til-jan-thomas', 'finnes-ikke'), undefined)
  })

  it('whitelists the zipf chart as embeddable', () => {
    assert.ok(EMBEDDABLE_CHARTS.has('zipf-distribution'))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --import=tsx --test tests/lib/hvitbok-embeds.test.ts`
Expected: FAIL — cannot find module `../../src/lib/hvitbok/embeds`.

- [ ] **Step 3: Write the embed registry**

Create `src/lib/hvitbok/embeds.ts`:

```ts
export type NokkeltallEmbed = {
  kind: 'nokkeltall'
  label: string
  value: string
  enhet?: string
  kilde: string
}

export type CalloutEmbed = {
  kind: 'callout'
  tekst: string
  kilde?: string
  variant: 'info' | 'sitat' | 'advarsel'
}

export type VizEmbed = {
  kind: 'viz'
  chartId?: string
  href: string
  label: string
  description: string
}

export type RelatertEmbed = {
  kind: 'relatert'
  lenker: Array<{ href: string; label: string; description: string }>
}

export type EmbedDefinition =
  | NokkeltallEmbed
  | CalloutEmbed
  | VizEmbed
  | RelatertEmbed

export const EMBEDDABLE_CHARTS: Set<string> = new Set(['zipf-distribution'])

export const chapterEmbeds: Record<string, Record<string, EmbedDefinition>> = {
  'kort-til-jan-thomas': {
    'oeko-melk-anvendelse': {
      kind: 'nokkeltall',
      label: 'Anvendelsesgrad økologisk melk',
      value: '80',
      enhet: '%',
      kilde: 'Landbruksdirektoratet 2026',
    },
    'landbruksdir-sitat': {
      kind: 'callout',
      variant: 'sitat',
      tekst:
        'Det var ikke nok økologisk melk til å dekke etterspørselen. Norsk melkeråvare avkortet derfor leveranser av økologisk melk i store deler av 2025.',
      kilde: 'Landbruksdirektoratet 2026',
    },
    'butikk-zipf': {
      kind: 'viz',
      chartId: 'zipf-distribution',
      href: '/sammenligning',
      label: 'Zipf-fordeling — butikker per kommune',
      description: 'Hvor konsentrert butikkstrukturen er på tvers av kommuner.',
    },
    'jt-relatert': {
      kind: 'relatert',
      lenker: [
        {
          href: '/eierskap',
          label: 'Eierskap',
          description: 'Hvem som eier de store dagligvareaktørene.',
        },
        {
          href: '/graf',
          label: 'Kunnskapsgraf',
          description: 'Relasjoner mellom selskaper, personer og roller.',
        },
      ],
    },
  },
  'nordisk-sirkularitet': {
    'dk-soya-sporing': {
      kind: 'nokkeltall',
      label: 'Fysisk sporbar dansk soya-import',
      value: '6',
      enhet: '%',
      kilde: 'IFRO/KU 2025',
    },
    'eudr-frist': {
      kind: 'callout',
      variant: 'advarsel',
      tekst:
        'EUDR krever 100 % sporing fra 30.12.2026. Norge har eksplisitt unntatt soya — en EU-norsk asymmetri.',
      kilde: 'EUDR / egen analyse',
    },
    'sirk-relatert': {
      kind: 'relatert',
      lenker: [
        {
          href: '/forsyningskjede',
          label: 'Forsyningskjede',
          description: 'Nordisk dekning av forsyningskjede-data.',
        },
        {
          href: '/verdikjede',
          label: 'Verdikjede',
          description: 'Verdikjede-flyt i matsektoren.',
        },
      ],
    },
  },
  fokusomraader: {
    'fokus-intro': {
      kind: 'callout',
      variant: 'info',
      tekst:
        'De fem fokusområdene er rangert etter score i transition-group-vurderingen.',
    },
    'fokus-relatert': {
      kind: 'relatert',
      lenker: [
        {
          href: '/mandat',
          label: 'Mandat',
          description: 'Transition groupens mandat og avgrensning.',
        },
        {
          href: '/innsikt',
          label: 'Innsikt',
          description: 'Innsiktskorpus bak fokusområdene.',
        },
      ],
    },
  },
}

export function getEmbed(
  chapterSlug: string,
  tokenId: string,
): EmbedDefinition | undefined {
  return chapterEmbeds[chapterSlug]?.[tokenId]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --import=tsx --test tests/lib/hvitbok-embeds.test.ts`
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/hvitbok/embeds.ts tests/lib/hvitbok-embeds.test.ts
git commit -m "feat: add hvitbok embed registry"
```

---

## Task 7: Embed components

**Files:**
- Create: `src/components/hvitbok/KeyFigureBox.tsx`
- Create: `src/components/hvitbok/CalloutBox.tsx`
- Create: `src/components/hvitbok/RelatedVisuals.tsx`
- Create: `src/components/hvitbok/EmbeddedChart.tsx`

No unit tests — these are presentational components verified via typecheck, build and dev server (consistent with other presentational components in the repo).

- [ ] **Step 1: Write KeyFigureBox**

Create `src/components/hvitbok/KeyFigureBox.tsx`:

```tsx
import type { NokkeltallEmbed } from '@/lib/hvitbok/embeds'

export function KeyFigureBox({ embed }: { embed: NokkeltallEmbed }) {
  return (
    <div className="my-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
      <p className="text-[10px] uppercase tracking-wider text-emerald-700">
        {embed.label}
      </p>
      <p className="mt-1 text-3xl font-bold text-stone-900">
        {embed.value}
        {embed.enhet && (
          <span className="ml-1 text-lg font-semibold text-stone-500">
            {embed.enhet}
          </span>
        )}
      </p>
      <p className="mt-2 text-xs text-stone-500">Kilde: {embed.kilde}</p>
    </div>
  )
}
```

- [ ] **Step 2: Write CalloutBox**

Create `src/components/hvitbok/CalloutBox.tsx`:

```tsx
import type { CalloutEmbed } from '@/lib/hvitbok/embeds'

const VARIANT_STYLE: Record<CalloutEmbed['variant'], string> = {
  info: 'border-sky-200 bg-sky-50/60',
  sitat: 'border-stone-300 bg-stone-50',
  advarsel: 'border-amber-200 bg-amber-50/60',
}

export function CalloutBox({ embed }: { embed: CalloutEmbed }) {
  return (
    <div
      className={`my-4 rounded-xl border p-5 ${VARIANT_STYLE[embed.variant]}`}
    >
      <p
        className={
          embed.variant === 'sitat'
            ? 'text-sm italic leading-relaxed text-stone-700'
            : 'text-sm leading-relaxed text-stone-700'
        }
      >
        {embed.variant === 'sitat' ? `«${embed.tekst}»` : embed.tekst}
      </p>
      {embed.kilde && (
        <p className="mt-2 text-xs text-stone-500">— {embed.kilde}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Write RelatedVisuals**

Create `src/components/hvitbok/RelatedVisuals.tsx`:

```tsx
import Link from 'next/link'

export type RelatedVisualLink = {
  href: string
  label: string
  description: string
}

export function RelatedVisuals({
  links,
  title = 'Relaterte visualiseringer',
}: {
  links: RelatedVisualLink[]
  title?: string
}) {
  if (links.length === 0) return null
  return (
    <div className="my-4 rounded-xl border border-stone-200 bg-white p-5">
      <p className="text-sm font-semibold text-stone-800">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group flex items-start gap-2 text-sm"
            >
              <span className="text-stone-400 group-hover:text-emerald-600">
                →
              </span>
              <span>
                <span className="font-medium text-emerald-700 group-hover:underline">
                  {l.label}
                </span>
                <span className="block text-xs text-stone-500">
                  {l.description}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 4: Write EmbeddedChart**

Create `src/components/hvitbok/EmbeddedChart.tsx`:

```tsx
import { ZipfDistributionChart } from '@/components/charts/ZipfDistributionChart'

const CHART_COMPONENTS: Record<
  string,
  React.ComponentType<{ country?: string }>
> = {
  'zipf-distribution': ZipfDistributionChart,
}

export function EmbeddedChart({ chartId }: { chartId: string }) {
  const Chart = CHART_COMPONENTS[chartId]
  if (!Chart) return null
  return (
    <div className="my-4">
      <Chart country="no" />
    </div>
  )
}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/hvitbok/
git commit -m "feat: add hvitbok embed components"
```

---

## Task 8: Chapter render layer

**Files:**
- Modify: `src/lib/hvitbok/render-chapter.tsx` (add `renderChapter` below `parseChapter`)

`renderChapter` produces a JSX node array; it is verified via the chapter page (Task 9), build and dev server, not a unit test.

- [ ] **Step 1: Add renderChapter**

Add these imports at the top of `src/lib/hvitbok/render-chapter.tsx` (above the existing `ChapterSegment` type):

```tsx
import type { ReactNode } from 'react'
import { marked } from 'marked'
import { getEmbed, EMBEDDABLE_CHARTS } from './embeds'
import { KeyFigureBox } from '@/components/hvitbok/KeyFigureBox'
import { CalloutBox } from '@/components/hvitbok/CalloutBox'
import { RelatedVisuals } from '@/components/hvitbok/RelatedVisuals'
import { EmbeddedChart } from '@/components/hvitbok/EmbeddedChart'
```

Then append this function to the end of the file:

```tsx
function renderEmbed(
  chapterSlug: string,
  tokenType: string,
  tokenId: string,
  key: string,
): ReactNode {
  const embed = getEmbed(chapterSlug, tokenId)
  if (!embed || embed.kind !== tokenType) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div
          key={key}
          className="my-4 rounded border border-red-300 bg-red-50 p-3 text-xs text-red-700"
        >
          Mangler embed-definisjon: {tokenType}:{tokenId}
        </div>
      )
    }
    return null
  }

  if (embed.kind === 'nokkeltall') {
    return <KeyFigureBox key={key} embed={embed} />
  }
  if (embed.kind === 'callout') {
    return <CalloutBox key={key} embed={embed} />
  }
  if (embed.kind === 'relatert') {
    return <RelatedVisuals key={key} links={embed.lenker} />
  }
  // embed.kind === 'viz'
  if (embed.chartId && EMBEDDABLE_CHARTS.has(embed.chartId)) {
    return <EmbeddedChart key={key} chartId={embed.chartId} />
  }
  return (
    <RelatedVisuals
      key={key}
      links={[
        {
          href: embed.href,
          label: embed.label,
          description: embed.description,
        },
      ]}
    />
  )
}

export function renderChapter(
  markdown: string,
  chapterSlug: string,
): ReactNode[] {
  return parseChapter(markdown).map((seg, i) => {
    const key = `seg-${i}`
    if (seg.kind === 'markdown') {
      const html = marked(seg.content, { gfm: true }) as string
      return (
        <article
          key={key}
          className="prose prose-stone max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-emerald-700 prose-a:no-underline hover:prose-a:underline prose-table:text-xs"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )
    }
    return renderEmbed(chapterSlug, seg.tokenType, seg.tokenId, key)
  })
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 3: Re-run the parser test (regression check)**

Run: `node --import=tsx --test tests/lib/hvitbok-parse.test.ts`
Expected: PASS — 5 tests still pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/hvitbok/render-chapter.tsx
git commit -m "feat: add hvitbok chapter render layer"
```

---

## Task 9: Chapter detail page

**Files:**
- Create: `src/app/hvitbok/[chapter]/page.tsx`

- [ ] **Step 1: Write the page**

Create `src/app/hvitbok/[chapter]/page.tsx`:

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  chapters,
  getChapterBySlug,
  getAdjacentChapters,
} from '@/lib/hvitbok/chapters'
import { readChapterMarkdown, countChapterWords } from '@/lib/hvitbok/loader'
import { renderChapter } from '@/lib/hvitbok/render-chapter'

export function generateStaticParams() {
  return chapters.map((c) => ({ chapter: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>
}) {
  const { chapter: slug } = await params
  const ch = getChapterBySlug(slug)
  if (!ch) return { title: 'Ikke funnet' }
  return { title: `${ch.title} — Hvitbok`, description: ch.subtitle }
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>
}) {
  const { chapter: slug } = await params
  const ch = getChapterBySlug(slug)
  if (!ch) notFound()

  const markdown = readChapterMarkdown(ch.filePath)
  const words = countChapterWords(ch.filePath)
  const { prev, next } = getAdjacentChapters(slug)

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/hvitbok" className="hover:text-emerald-700">
          Hvitbok
        </Link>
        <span>/</span>
        <span className="font-medium text-stone-700">Kapittel {ch.number}</span>
      </nav>

      <header className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-5">
        <p className="text-[10px] uppercase tracking-wider text-emerald-600">
          Kapittel {ch.number}
        </p>
        <h1 className="text-xl font-bold leading-snug text-stone-900">
          {ch.title}
        </h1>
        {ch.subtitle && (
          <p className="mt-1 text-sm text-stone-500">{ch.subtitle}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-stone-400">
          {ch.audience && (
            <span>
              <span className="font-medium text-stone-500">Målgruppe:</span>{' '}
              {ch.audience}
            </span>
          )}
          {ch.status && (
            <span>
              <span className="font-medium text-stone-500">Status:</span>{' '}
              {ch.status}
            </span>
          )}
          <span>~{words.toLocaleString('nb-NO')} ord</span>
        </div>
      </header>

      <div>{renderChapter(markdown, ch.slug)}</div>

      <nav className="flex items-center justify-between gap-4 border-t border-stone-200 pt-4">
        <div className="flex-1">
          {prev ? (
            <Link
              href={`/hvitbok/${prev.slug}`}
              className="group flex flex-col rounded-lg border border-stone-200 bg-white p-3 hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="text-[10px] uppercase tracking-wider text-stone-400">
                ← Forrige
              </span>
              <span className="text-xs font-medium text-stone-700 group-hover:text-emerald-700">
                {prev.title}
              </span>
            </Link>
          ) : (
            <Link
              href="/hvitbok"
              className="group flex flex-col rounded-lg border border-stone-200 bg-white p-3 hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="text-[10px] uppercase tracking-wider text-stone-400">
                ← Tilbake
              </span>
              <span className="text-xs font-medium text-stone-700 group-hover:text-emerald-700">
                Innholdsfortegnelse
              </span>
            </Link>
          )}
        </div>
        <div className="flex flex-1 justify-end">
          {next ? (
            <Link
              href={`/hvitbok/${next.slug}`}
              className="group flex flex-col items-end rounded-lg border border-stone-200 bg-white p-3 text-right hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="text-[10px] uppercase tracking-wider text-stone-400">
                Neste →
              </span>
              <span className="text-xs font-medium text-stone-700 group-hover:text-emerald-700">
                {next.title}
              </span>
            </Link>
          ) : (
            <Link
              href="/hvitbok"
              className="group flex flex-col items-end rounded-lg border border-stone-200 bg-white p-3 text-right hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="text-[10px] uppercase tracking-wider text-stone-400">
                Tilbake →
              </span>
              <span className="text-xs font-medium text-stone-700 group-hover:text-emerald-700">
                Innholdsfortegnelse
              </span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/hvitbok/\[chapter\]/page.tsx
git commit -m "feat: add hvitbok chapter detail page"
```

---

## Task 10: Table-of-contents page and nav entry

**Files:**
- Create: `src/app/hvitbok/page.tsx`
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Write the TOC page**

Create `src/app/hvitbok/page.tsx`:

```tsx
import Link from 'next/link'
import { chapters } from '@/lib/hvitbok/chapters'

export const metadata = {
  title: 'Hvitbok — Food Systems',
  description: 'Food Systems sitt leveransedokument, delt i kapitler.',
}

export default function HvitbokPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <header className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-6">
        <h1 className="text-2xl font-bold text-stone-900">Hvitbok</h1>
        <p className="mt-1 text-sm text-stone-500">
          Food Systems sitt leveransedokument — notater og rapporter til
          transition group, delt i kapitler.
        </p>
      </header>

      <ol className="space-y-3">
        {chapters.map((ch) => (
          <li key={ch.slug}>
            <Link
              href={`/hvitbok/${ch.slug}`}
              className="group flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-4 hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="text-lg font-bold text-emerald-600">
                {ch.number}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-stone-800 group-hover:text-emerald-700">
                  {ch.title}
                </span>
                {ch.subtitle && (
                  <span className="block text-xs text-stone-500">
                    {ch.subtitle}
                  </span>
                )}
                <span className="mt-1 flex flex-wrap gap-3 text-[11px] text-stone-400">
                  {ch.audience && <span>Målgruppe: {ch.audience}</span>}
                  {ch.status && <span>Status: {ch.status}</span>}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
```

- [ ] **Step 2: Add the nav entry**

In `src/components/layout/Header.tsx`, find the nav array line:

```tsx
  { name: 'Rapporter', href: '/rapporter' },
```

Add a new line immediately after it:

```tsx
  { name: 'Hvitbok', href: '/hvitbok' },
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/hvitbok/page.tsx src/components/layout/Header.tsx
git commit -m "feat: add hvitbok table-of-contents page and nav entry"
```

---

## Task 11: Content integrity test

**Files:**
- Create: `tests/lib/hvitbok-integrity.test.ts`

This test guards the whole content layer: every chapter file exists, every token in every chapter has a matching embed definition of the right kind, every embed definition is referenced by a token, and every `viz`/`relatert` href points to a real app route.

- [ ] **Step 1: Write the test**

Create `tests/lib/hvitbok-integrity.test.ts`:

```ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { chapters } from '../../src/lib/hvitbok/chapters'
import { chapterEmbeds } from '../../src/lib/hvitbok/embeds'
import { parseChapter } from '../../src/lib/hvitbok/render-chapter'
import { readChapterMarkdown } from '../../src/lib/hvitbok/loader'

const APP_DIR = path.join(process.cwd(), 'src/app')

function routeExists(href: string): boolean {
  const segment = href.replace(/^\//, '').split('/')[0]
  return fs.existsSync(path.join(APP_DIR, segment))
}

describe('hvitbok content integrity', () => {
  it('every chapter file exists on disk', () => {
    for (const ch of chapters) {
      assert.ok(
        fs.existsSync(path.join(process.cwd(), ch.filePath)),
        `missing file: ${ch.filePath}`,
      )
    }
  })

  it('every token in every chapter has a matching embed definition', () => {
    for (const ch of chapters) {
      const segs = parseChapter(readChapterMarkdown(ch.filePath))
      for (const seg of segs) {
        if (seg.kind !== 'token') continue
        const embed = chapterEmbeds[ch.slug]?.[seg.tokenId]
        assert.ok(
          embed,
          `${ch.slug}: token ${seg.tokenType}:${seg.tokenId} has no embed`,
        )
        assert.equal(
          embed.kind,
          seg.tokenType,
          `${ch.slug}: token ${seg.tokenId} kind mismatch`,
        )
      }
    }
  })

  it('every embed definition is referenced by a token', () => {
    for (const ch of chapters) {
      const used = new Set(
        parseChapter(readChapterMarkdown(ch.filePath))
          .filter((s) => s.kind === 'token')
          .map((s) => (s as { tokenId: string }).tokenId),
      )
      for (const tokenId of Object.keys(chapterEmbeds[ch.slug] ?? {})) {
        assert.ok(
          used.has(tokenId),
          `${ch.slug}: embed ${tokenId} is never referenced`,
        )
      }
    }
  })

  it('every viz and relatert href points to a real app route', () => {
    for (const embeds of Object.values(chapterEmbeds)) {
      for (const embed of Object.values(embeds)) {
        if (embed.kind === 'viz') {
          assert.ok(routeExists(embed.href), `dead route: ${embed.href}`)
        }
        if (embed.kind === 'relatert') {
          for (const l of embed.lenker) {
            assert.ok(routeExists(l.href), `dead route: ${l.href}`)
          }
        }
      }
    }
  })
})
```

- [ ] **Step 2: Run the test**

Run: `node --import=tsx --test tests/lib/hvitbok-integrity.test.ts`
Expected: PASS — 4 tests. If a test fails, the seed content (Task 2) or embed registry (Task 6) has a typo — fix the mismatch, do not weaken the test.

- [ ] **Step 3: Commit**

```bash
git add tests/lib/hvitbok-integrity.test.ts
git commit -m "test: add hvitbok content integrity guard"
```

---

## Task 12: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 3: Full test suite**

Run: `npm test`
Expected: all tests pass, including the 5 new `hvitbok-*` suites.

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: build succeeds; output lists `/hvitbok` and `/hvitbok/[chapter]` routes.

- [ ] **Step 5: Dev-server smoke test**

Run `npm run dev -- -p 3001` (port 3001 to avoid colliding with the sibling Circular Cities project on 3000). In a browser:
- Open `http://localhost:3001/hvitbok` — confirm the three chapters list.
- Open chapter 1 — confirm the key-figure box, the quote callout, the embedded Zipf chart, and the related-visualizations card all render, and prev/next navigation works.
- Confirm the "Hvitbok" entry appears in the header nav.

Stop the dev server when done.

- [ ] **Step 6: Commit (if any verification fixes were needed)**

```bash
git add -A
git commit -m "fix: hvitbok verification fixes"
```

If no fixes were needed, skip this commit.

---

## Self-Review Notes

- **Spec coverage:** Routes (T9, T10) ✓; markdown content source (T1, T2) ✓; chapter registry (T3) ✓; loader (T4) ✓; token parser (T5) ✓; embed registry with four types (T6) ✓; embed components (T7) ✓; render layer with dev-mode missing-embed warning (T8) ✓; nav entry (T10) ✓; parser + integrity tests (T5, T11) ✓; 3 seed chapters demonstrating nokkeltall/callout/viz embeds (T2, T6) ✓; error handling — unknown slug `notFound`, missing embed dev-warning, missing file throws (T8, T9, T4) ✓.
- **Out of scope per spec:** no DB, no in-app editing, no MDX, `/rapporter` untouched — respected.
- **Type consistency:** `ChapterSegment`, `Chapter`, `EmbedDefinition` and its four variants, `getEmbed`, `EMBEDDABLE_CHARTS`, `parseChapter`, `renderChapter` are used with identical signatures across tasks.
