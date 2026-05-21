# Forsyningskjede Next Session Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` for parallel research/review tasks or `superpowers:executing-plans` for inline execution. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Continue the Nordic supply-chain parity work until `/forsyningskjede` has a defensible, similarly covered insight and data basis for NO, SE, DK, FI and IS.

**Architecture:** Keep canonical/runtime data separate from review evidence. Promote only primary-checked rows from review files into runtime/core-series after an explicit method decision. Show direct observations, proxy series, estimates and local research as separate status lanes.

**Tech Stack:** Markdown/CSV review artifacts, local JSON data under `public/data/food-systems/`, Nordic normalized CSV panels under `research/data/nordic/`, optional StatBank/PxWeb/API source checks.

---

## Open First

- `docs/project/plans/RESEARCH-PLAN-FORSYNINGSKJEDE-NORDISK-LIKEDEKNING-2026-04-29.md`
- `docs/project/analysis/forsyningskjede-nordic-coverage-ledger-2026-04-29.csv`
- `research/review/forsyningskjede-primary-source-check-queue-2026-04-29.csv`
- `research/review/forsyningskjede-production-primary-snapshot-2026-04-29.md`
- `research/review/forsyningskjede-production-proxy-candidates-2026-04-29.csv`
- `research/review/forsyningskjede-production-series-parity-2026-04-29.csv`
- `research/review/supply-chain-relationships-nordic-review-2026-04-29.csv`
- `docs/project/forsyningskjede-country-packs/README.md`

## Current Boundary

Confirmed:

- Annual trade coverage is ready for all five countries through `trade-group-imports-annual.csv`.
- Import vulnerability cards exist for NO, SE, DK, FI and IS.
- `value-chain.json` is structurally 8/8 for NO, SE, DK, FI and IS.
- DK has primary snapshots for cereals/H170, milk, pigs, potatoes, Danish-vessel landings and aquaculture.
- IS has primary snapshots for seafood-first production plus agriculture supplement: milk, meat, potatoes, selected vegetables, grain and oats.

Still not complete:

- DK H170 is not pure oats. It can only be used as a caveated proxy lane.
- IS oats is context only, not real parity with NO/SE/FI oats.
- DK/IS proxy baskets are not imported into canonical `production_annual_first_panel.csv`.
- IS value-chain backfilled ledd still need actor/source validation.
- SE/DK/FI seafood backfills need primary validation.
- Relationship parity is still thin for SE/DK/FI/IS.

## Task 1: Lock Production Method

**Files:**
- Create: `research/review/forsyningskjede-production-method-decision-2026-04-29.md`
- Read: `research/review/forsyningskjede-production-series-parity-2026-04-29.csv`
- Read: `research/review/forsyningskjede-production-proxy-candidates-2026-04-29.csv`
- Modify after decision: `docs/project/analysis/forsyningskjede-nordic-coverage-ledger-2026-04-29.csv`

- [x] **Step 1: Write method decision**

Create a short decision note with these lanes:

```markdown
# Forsyningskjede Production Method Decision

Dato: 2026-04-29

## Decision

- Direct oats lane: NO, SE and FI only.
- Caveated proxy lane: DK HST77 H170, labelled as `Oats, mixed grains and other grains`, not pure oats.
- Seafood-first lane: IS wild catch plus aquaculture, with agriculture supplement shown separately.
- Do not merge DK/IS proxy lanes into the same visual series as NO/SE/FI direct oats.
- Do not import DK/IS proxy rows into `production_annual_first_panel.csv` until a canonical schema for proxy lanes exists.

## Display Rule

Every visual must expose `series_type`:

- `direct_commodity_series`
- `caveated_proxy_series`
- `country_specific_basket`
- `context_only`

## Current Use

- Use `research/review/forsyningskjede-production-series-parity-2026-04-29.csv` as the working parity summary.
- Use `research/review/forsyningskjede-production-proxy-candidates-2026-04-29.csv` as source-level evidence.
```

- [x] **Step 2: Update PCQ statuses**

Set production method rows to `method_decision_recorded` only after the method file exists:

- `PCQ-FS-PROD-001`
- `PCQ-FS-PROD-DK-001`
- `PCQ-FS-PROD-IS-001`

- [x] **Step 3: Validate CSVs**

Run:

```bash
node -e "const fs=require('fs'); const files=['docs/project/analysis/forsyningskjede-nordic-coverage-ledger-2026-04-29.csv','research/review/forsyningskjede-primary-source-check-queue-2026-04-29.csv','research/review/forsyningskjede-production-series-parity-2026-04-29.csv','research/review/forsyningskjede-production-proxy-candidates-2026-04-29.csv']; function parse(s){const rows=[];let row=[],field='',q=false;for(let i=0;i<s.length;i++){const c=s[i],n=s[i+1];if(q){if(c==='\"'&&n==='\"'){field+='\"';i++;}else if(c==='\"'){q=false;}else field+=c;}else{if(c==='\"')q=true;else if(c===','){row.push(field);field='';}else if(c==='\n'){row.push(field);rows.push(row);row=[];field='';}else if(c==='\r'||c==='\uFEFF'){}else field+=c;}} if(field.length||row.length){row.push(field);rows.push(row);} return rows.filter(r=>!(r.length===1&&r[0]===''));} for(const f of files){const rows=parse(fs.readFileSync(f,'utf8'));const width=rows[0].length;const bad=rows.map((r,i)=>[i+1,r.length]).filter(x=>x[1]!==width); if(bad.length){console.error(f,'BAD',bad.slice(0,5)); process.exitCode=1;} else console.log(f, rows.length-1+' rows x '+width+' cols');}"
```

Expected: all listed CSV files report consistent row and column counts.

## Task 2: Primary-Check Value-Chain Backfills

**Files:**
- Modify: `research/review/forsyningskjede-primary-source-check-queue-2026-04-29.csv`
- Modify only after evidence is checked: `public/data/food-systems/{se,dk,fi,is}/value-chain.json`
- Update: `docs/project/forsyningskjede-country-packs/{se,dk,fi,is}.md`

- [ ] **Step 1: IS value-chain validation**

Resolve these rows first:

- `PCQ-FS-IS-001`: processing actor list and processing claim.
- `PCQ-FS-IS-002`: distribution ownership and logistics roles.
- `PCQ-FS-IS-003`: retail/HORECA actor role validation.
- `PCQ-FS-IS-004`: household/import dependency claims.

- [ ] **Step 2: SE/DK/FI seafood validation**

Resolve:

- `PCQ-FS-SE-001`
- `PCQ-FS-DK-001`
- `PCQ-FS-FI-001`

Do not mark as validated just because import values are traceable. Export, hub/re-export and actor-role claims need their own source check.

- [ ] **Step 3: JSON parse check**

Run:

```bash
node -e "const fs=require('fs'); for (const c of ['no','se','dk','fi','is']) { JSON.parse(fs.readFileSync('public/data/food-systems/'+c+'/value-chain.json','utf8')); console.log(c,'json ok'); }"
```

Expected: five `json ok` lines.

## Task 3: Build Relationship Parity

**Files:**
- Modify: `research/review/supply-chain-relationships-nordic-review-2026-04-29.csv`
- Update: `docs/project/forsyningskjede-country-packs/{se,dk,fi,is}.md`
- Later, only after approval: DB import route for `BusinessRelationship`

- [ ] **Step 1: Expand candidate queue**

Target per country:

- SE: 20 reviewed candidates, minimum 10 approved/import-ready.
- DK: 20 reviewed candidates, minimum 10 approved/import-ready.
- FI: 20 reviewed candidates, minimum 10 approved/import-ready.
- IS: 20 reviewed candidates, minimum 10 approved/import-ready.

- [ ] **Step 2: Keep review states strict**

Allowed statuses:

- `ready_for_import`
- `needs_primary_check`
- `needs_actor_validation`
- `hold`
- `reject_archive`

- [ ] **Step 3: Evidence rule**

Every `ready_for_import` relationship must have:

- source URL or local source path
- source owner
- relationship type
- direction
- confidence
- short caveat if the edge is inferred

## Task 4: Define `/forsyningskjede` Display Contract

**Files:**
- Create: `docs/project/reference/forsyningskjede-display-contract-2026-04-29.md`
- Read: `docs/project/analysis/forsyningskjede-nordic-coverage-ledger-2026-04-29.csv`
- Later modify UI only after this contract is accepted.

- [x] **Step 1: Specify visible status lanes**

The page should distinguish:

- `validated`
- `primary_snapshot`
- `proxy_model`
- `local_research_needs_primary_check`
- `missing`

- [x] **Step 2: Specify country cards**

Each country card should show:

- value-chain coverage
- import panel status
- production method status
- relationship count/status
- circularity/nutrient status
- top unresolved PCQ rows

- [x] **Step 3: Hold UI edits**

Do not change UI until the display contract says exactly which files power each visible component.

## Task 5: IS-Specific Missing Layers

**Files:**
- Modify: `docs/project/forsyningskjede-country-packs/is.md`
- Modify: `docs/project/analysis/forsyningskjede-nordic-coverage-ledger-2026-04-29.csv`
- Possible later data files: `public/data/food-systems/circularity-loops.json`, `public/data/food-systems/nutrient-flows.json`

- [ ] **Step 1: Circularity**

Find three IS-specific circularity or side-stream cases, or document why comparable cases are not available.

- [ ] **Step 2: Nutrient flows**

Either add an IS nutrient model object with confidence/caveat, or mark IS as explicit non-comparable gap.

- [ ] **Step 3: Seafood processing/exports/feed**

Create a focused source queue for:

- fish processing share
- top seafood processors
- export concentration
- aquaculture feed/input relevance

## Final Validation Before Claiming Progress

Run:

```bash
git status --short
```

Run CSV validation from Task 1.

Run JSON validation from Task 2.

Then summarize:

- what was moved from `needs_primary_check` to stronger status
- what remains proxy/caveat only
- what was deliberately not imported into canonical/runtime data
