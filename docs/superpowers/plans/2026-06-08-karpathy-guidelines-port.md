# Karpathy Guidelines Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the four Karpathy behavioral guidelines into this repo as an always-on summary in `CLAUDE.md` plus a detailed on-demand guide with TS/Prisma examples.

**Architecture:** Two files. (1) A new `## Behavioral guidelines` section in root `CLAUDE.md` (~13 lines, loaded every turn) holding the four principle headlines with cross-reference pointers. (2) A new `.claude/karpathy-guidelines.md` deep-dive (full principles + 8 worked examples + anti-pattern table) linked from that section. `code-conventions.md` is cross-referenced, never edited.

**Tech Stack:** Markdown only. No application code. Because this is prose/config, TDD's red-green loop does not apply — verification is link-resolution, line-count, `npm run lint`, and `npm run build` (sanity gate). Example code lives inside a `.md` and is never compiled, so it is validated by reading (syntactically valid TS, obeys `code-conventions.md`), not by `tsc`.

**Spec:** `docs/superpowers/specs/2026-06-08-karpathy-guidelines-port-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `.claude/karpathy-guidelines.md` (new) | The deep-dive: four principles expanded, each with an in-repo cross-ref; 8 ❌→✅ examples in TS/Next/Prisma; anti-pattern table; "how to know it's working". Loaded on demand when examples/depth are needed. |
| `CLAUDE.md` (modify) | Add one always-on `## Behavioral guidelines` section after `## Essentials`. Four headlines + pointers + a link to the deep-dive. |

Models referenced in examples (`Setting`, `CompanyRow`, `ProducerRow`, `Producer`) are **illustrative** — the guide says so explicitly. They are not claims about real schema and are never compiled.

---

## Task 1: Create the detailed guide

**Files:**
- Create: `.claude/karpathy-guidelines.md`

- [ ] **Step 1: Write the guide file**

Write the following content verbatim to `.claude/karpathy-guidelines.md`:

````markdown
# Karpathy behavioral guidelines

Guidelines to reduce common LLM coding mistakes in this repo. Adapted from
[`forrestchang/andrej-karpathy-skills`](https://github.com/forrestchang/andrej-karpathy-skills)
(MIT), derived from [Andrej Karpathy's notes](https://x.com/karpathy/status/2015883857489522876)
on LLM coding pitfalls.

These apply to **every task**. Root `CLAUDE.md` carries the one-line summary; this file is
the depth + worked examples. **Tradeoff:** bias toward caution over speed on non-trivial
work; use judgment on trivial fixes.

## 1. Think before coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

→ In this repo: the `brainstorming` skill operationalizes this for feature/behavior work.

## 2. Simplicity first

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or configurability that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Test: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

→ In this repo: see `.claude/code-conventions.md`.

## 3. Surgical changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

Test: every changed line traces directly to the request.

→ In this repo: see `.claude/code-conventions.md`.

## 4. Goal-driven execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

→ In this repo: the `test-driven-development` and `verification-before-completion` skills
turn this into practice.

---

## Worked examples

Illustrative ❌→✅ pairs in our stack (TypeScript / Next.js / Prisma). Model code obeys
`.claude/code-conventions.md` (single quotes, `type` over `interface`, sparse comments).
Model and type names are illustrative, not a claim about specific files.

### Think before coding

**1. Hidden assumptions** — Request: "Add a feature to export company data."

❌ Picks scope, fields, format, and destination silently:
```ts
export async function exportCompanies(format = 'json') {
  const companies = await prisma.company.findMany()
  if (format === 'json') {
    await writeFile('companies.json', JSON.stringify(companies))
  } else {
    await writeFile('companies.csv', companies.map((c) => `${c.orgNumber},${c.name}`).join('\n'))
  }
  return `Exported ${companies.length} companies`
}
```
Assumed: all companies (privacy?), the file path, which fields, the CSV columns.

✅ Surface the assumptions, then ask:
```
Before implementing, a few things to pin down:
1. Scope — all companies, or a filtered set?
2. Shape — browser download, an API endpoint, or a background job?
3. Fields — which? (some ownership/financial fields may be sensitive)
4. Volume — roughly how many rows? (affects streaming vs in-memory)

Simplest first cut: an API route returning paginated JSON. Which way do you want it?
```

**2. Multiple interpretations** — Request: "Make /selskap faster."

❌ Silently adds caching, indexes, and parallel queries at once.

✅ Name the interpretations with rough effort, then ask:
```
"Faster" could mean:
1. Response time (500ms → <150ms) — add a Prisma index + cache the metrics query (~2h)
2. Throughput (more concurrent loads) — connection pooling / batching (~4h)
3. Perceived speed — stream the shell, defer the heavy panels (~3h)

/selskap is ~500ms server-side now. Which matters most here?
```

### Simplicity first

**3. Over-abstraction** — Request: "Add a function to calculate ownership share."

❌ A strategy hierarchy for a one-line calculation:
```ts
abstract class OwnershipStrategy {
  abstract calculate(owned: number, total: number): number
}
class PercentageOwnership extends OwnershipStrategy {
  calculate(owned: number, total: number) { return total === 0 ? 0 : owned / total }
}
class OwnershipCalculator {
  constructor(private strategy: OwnershipStrategy) {}
  apply(owned: number, total: number) { return this.strategy.calculate(owned, total) }
}
```

✅ One function until a second case actually exists:
```ts
export const ownershipShare = (owned: number, total: number): number =>
  total === 0 ? 0 : owned / total
```

**4. Speculative features** — Request: "Save a user setting to the database."

❌ A manager with cache, validator, notify, and merge flags nobody asked for:
```ts
class SettingManager {
  constructor(private cache = new InMemoryCache(), private validator = new DefaultValidator()) {}
  async save(userId: string, key: string, value: string, opts: { validate?: boolean; notify?: boolean } = {}) {
    if (opts.validate) this.validator.check(key, value)
    await prisma.setting.update({ where: { userId_key: { userId, key } }, data: { value } })
    this.cache.set(`${userId}:${key}`, value)
    if (opts.notify) this.notify(userId, key)
  }
  private notify(userId: string, key: string) { /* 30 more lines nobody needs */ }
}
```

✅ Just save it — idempotent upsert, per our conventions:
```ts
export async function saveSetting(userId: string, key: string, value: string) {
  await prisma.setting.upsert({
    where: { userId_key: { userId, key } },
    update: { value },
    create: { userId, key, value },
  })
}
```
Add caching/validation later, when there's a real reason.

### Surgical changes

**5. Drive-by refactoring** — Request: "Fix the crash when orgNumber is blank in the importer."

❌ Fixes the bug but also reformats, adds validation nobody asked for, rewrites comments:
```ts
function validateCompanyRow(row: CompanyRow): boolean {
  // Validate organisation number
  const orgNumber = (row.orgNumber ?? '').trim()
  if (!orgNumber) throw new Error('orgNumber required')
  if (!/^\d{9}$/.test(orgNumber)) throw new Error('orgNumber must be 9 digits')
  if (!row.name || row.name.length < 2) throw new Error('name too short') // not asked for
  return true
}
```

✅ Change only the line that fixes the crash:
```ts
function validateCompanyRow(row: CompanyRow) {
  // Check org number
  if (!row.orgNumber || row.orgNumber.length !== 9) {
    throw new Error('orgNumber must be 9 digits')
  }
  return true
}
```
(The crash was `row.orgNumber.length` on an undefined value; the guard fixes exactly that.)

**6. Style drift** — Request: "Add logging to the producer import function."

❌ Switches quote style, adds type annotations, reformats, changes return logic:
```ts
export async function importProducers(rows: ProducerRow[]): Promise<number> {
  logger.info(`Importing ${rows.length} producers`)
  let count = 0
  for (const row of rows) {
    await prisma.producer.upsert({ where: { orgNumber: row.orgNumber }, update: row, create: row })
    count++
  }
  return count
}
```
(Original used single quotes, returned nothing, and matched surrounding style.)

✅ Add only the log lines, match the existing style:
```ts
export async function importProducers(rows) {
  logger.info(`Importing ${rows.length} producers`)
  for (const row of rows) {
    await prisma.producer.upsert({ where: { orgNumber: row.orgNumber }, update: row, create: row })
  }
  logger.info('Producer import done')
}
```

### Goal-driven execution

**7. Vague vs verifiable** — Request: "Fix the citation system."

❌ "I'll review the citation code, find issues, and improve it." → edits without a target.

✅ Get a concrete failure, then define a reproduce-first plan:
```
To "fix citations" I need a success criterion. What's the symptom?

If it's "some SourceCitations show a broken URL":
1. Write a test loading a known-broken citation → expect it flagged. Verify: test fails (reproduces).
2. Fix the URL-validation path. Verify: test passes.
3. Run the citation-audit suite. Verify: no regressions.

What's the specific symptom you're seeing?
```

**8. Test-first** — Request: "Producer ranking is inconsistent when two producers tie on score."

❌ Rewrites the sort without reproducing the bug first.

✅ Reproduce with a test, then make it stable:
```ts
// 1. Failing test — order is non-deterministic for ties until we fix it
test('ranks producers deterministically when scores tie', () => {
  const producers = [
    { name: 'Tine', score: 100 },
    { name: 'Q-Meieriene', score: 100 },
    { name: 'Røros', score: 90 },
  ]
  expect(rankProducers(producers).map((p) => p.name)).toEqual(['Q-Meieriene', 'Tine', 'Røros'])
})

// 2. Stable tie-break by name
export const rankProducers = (producers: Producer[]): Producer[] =>
  [...producers].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
```

---

## Anti-patterns summary

| Principle | Anti-pattern | Fix |
|-----------|--------------|-----|
| Think before coding | Silently assumes scope/fields/format | List assumptions, ask before building |
| Simplicity first | Strategy hierarchy for a one-line calc | One function until a second case is real |
| Surgical changes | Reformats quotes / adds validation while fixing a bug | Change only the lines that fix the issue |
| Goal-driven execution | "I'll review and improve it" | "Reproduce with a test → make it pass → check regressions" |

## How to know it's working

- Fewer unnecessary changes in diffs — only what was requested appears.
- Fewer rewrites from overcomplication — simple the first time.
- Clarifying questions arrive before implementation, not after a mistake.
- Clean, minimal PRs — no drive-by refactoring.
````

- [ ] **Step 2: Verify the file exists and is non-trivial**

Run: `wc -l .claude/karpathy-guidelines.md`
Expected: a line count well over 150 (the content above).

- [ ] **Step 3: Verify cross-reference targets exist**

Run: `ls .claude/code-conventions.md` and confirm the named skills are real superpowers skills (`brainstorming`, `test-driven-development`, `verification-before-completion`).
Expected: `code-conventions.md` listed; the three skill names are available skills.

- [ ] **Step 4: Commit**

```bash
git add .claude/karpathy-guidelines.md
git commit -m "docs(guidelines): add karpathy behavioral guide (principles + TS examples)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Add the always-on section to CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (insert a new section after `## Essentials`, before `## Task-Specific Guides`)

- [ ] **Step 1: Insert the section**

In `CLAUDE.md`, immediately after the `## Essentials` block and before the `## Task-Specific Guides` heading, insert:

```markdown
## Behavioral guidelines

Apply to every task — the "why"; linked skills/guides are the "how". Full text + worked TS examples: [.claude/karpathy-guidelines.md](.claude/karpathy-guidelines.md). Bias toward caution on non-trivial work; use judgment on trivial fixes.

1. **Think before coding** — State assumptions; if a request is ambiguous, surface interpretations and ask rather than guess. → brainstorming skill
2. **Simplicity first** — Minimum code that solves the stated problem; no speculative abstraction or unrequested config. → code-conventions.md
3. **Surgical changes** — Every changed line traces to the request; match surrounding style; don't refactor or delete code you weren't asked to touch. → code-conventions.md
4. **Goal-driven execution** — Turn tasks into verifiable success criteria, then loop to green. → test-driven-development + verification-before-completion skills
```

Do **not** add `.claude/karpathy-guidelines.md` to the `## Task-Specific Guides` list — that list means "read only when the task matches," which is wrong for rules that apply to every task. The deep-dive is reached via the link in this section.

- [ ] **Step 2: Verify the section is present and within budget**

Run: `awk '/^## Behavioral guidelines$/,/^## Task-Specific Guides$/' CLAUDE.md | wc -l`
Expected: ≤ 17 lines (section body + blank lines, target ≤ 15 of content).

- [ ] **Step 3: Verify the deep-dive link resolves**

Run: `test -f .claude/karpathy-guidelines.md && echo OK`
Expected: `OK` (the relative link target exists).

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(guidelines): add always-on behavioral guidelines to CLAUDE.md

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Final verification

**Files:** none modified unless a check fails.

- [ ] **Step 1: Link / cross-reference sweep**

Run: `grep -nE 'code-conventions\.md|karpathy-guidelines\.md' CLAUDE.md .claude/karpathy-guidelines.md`
Expected: each referenced path resolves to a real file (`.claude/code-conventions.md`, `.claude/karpathy-guidelines.md`).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: passes (no new errors; markdown files are not linted by eslint, so this only confirms nothing broke).

- [ ] **Step 3: Build sanity gate**

Run: `npm run build`
Expected: succeeds. Docs do not affect the build; this confirms the repo is still green.

- [ ] **Step 4: Confirm success criteria from the spec**

Manually confirm:
- Both files exist and render as valid markdown.
- `CLAUDE.md` behavioral section ≤ 15 lines of content.
- All cross-refs name real skills/files.
- Example code is syntactically valid TS and follows `code-conventions.md`.

No commit unless a check above required a fix.

---

## Self-Review

**Spec coverage:**
- Decision 1 (full port) → Task 1 ports all four principles + examples. ✓
- Decision 2 (hybrid) → Task 1 (deep-dive) + Task 2 (always-on summary). ✓
- Decision 3 (TS examples) → Task 1 worked-examples section, 8 pairs. ✓
- Decision 4 (cross-reference) → every principle in both files ends with a `→` pointer; `code-conventions.md` untouched. ✓
- Decision 5 (Claude Code only) → no `.cursor/` or `.claude-plugin/` tasks. ✓
- Spec verification criteria → Task 3. ✓
- Spec "out of scope" items → none appear as tasks. ✓

**Placeholder scan:** No TBD/TODO; all file content is written verbatim, all commands are concrete. ✓

**Type consistency:** `rankProducers`, `ownershipShare`, `saveSetting`, `validateCompanyRow`, `importProducers` are each used once, self-consistently, inside illustrative examples (never cross-referenced across tasks). ✓
