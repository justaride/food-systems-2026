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
