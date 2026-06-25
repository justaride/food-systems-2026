# Circular Food Actor Registry - promptpack

Status: internal prompt pack, no claims.

Universal rules:

- Work in `/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/food-tg-research-os-2026-06-24`.
- Do not stage, commit, push, write DB data or publish.
- Use `research/_status/circular-food-actor-registry/` only for CAR artifacts.
- Primary source first; secondary only with `B` marking.
- Candidate default is unverified until registry/source evidence supports it.
- Keep people/founders only when openly sourced and professionally relevant.
- Always write `Ikke-si`.

## CAR-001 - Schema, Rules, Seed Index

Read existing seed files for circular actors and create the registry schema, inclusion/exclusion rules, dedupe rules, source hierarchy and `Ikke-si` rules.

Inputs:
- `research/norge/circular-actors/brreg-validated.md`
- `research/bibliotek/sirkularitet/sirkulaer-selskaper-norge.md`
- `research/exa-circular-actors-2026-04-21.md`
- `research/intake/perplexity-2026-04-20/new-actors.json`
- `research/intake/perplexity-2026-04-20-runde2/new-actors.json`
- existing `R12-ACTOR-*`, `R12-WASTE-*`, `R12-FEED-*`, `R12-GOV-004` outputs when present

Outputs:
- `CAR-000-schema-and-rules.md`
- `CAR-source-search-log.csv`
- `decisions/CAR-batch-01.jsonl`
- `reports/CAR-batch-01.md`

Gate: internal.

## CAR-002 - Consolidate Existing Seeds

Pull all actor candidates from local seed files into `CAR-registry-candidates.csv` without making them verified. Preserve source file, category, country, status, source class, gap and import decision. Mark duplicates, aliases and actors that need Brreg/org-number lookup.

Outputs:
- `CAR-registry-candidates.csv`
- `decisions/CAR-batch-02.jsonl`
- `reports/CAR-batch-02.md`

Gate: source-shortlist / actor-gate.

## CAR-003 - Brreg Norway Validation

Validate Norwegian company actors against Brønnøysund/Enhetsregisteret or existing Brreg-backed local notes. Fill org number, municipality, NACE note where relevant, status, founding year and organization form. Do not use NACE alone as proof of circular activity.

Outputs:
- append/update `CAR-registry-verified.csv`
- `reports/CAR-batch-03.md`
- explicit gap list for missing org numbers

Gate: verified / PCQ.

## CAR-004 - Matsvinn, Prevention, Redistribution

Map Norwegian actors in food-waste prevention, redistribution, surplus food, near-expiry retail, food rescue and the food-waste agreement ecosystem. Start with Too Good To Go, Holdbart, Matsentralen, Matvett, grocery/HORECA actors and municipal arrangements. Distinguish effect claim, platform role and realized volume.

Gate: source-shortlist / PCQ.

## CAR-005 - Side Streams, Upcycling, Ingredients

Map Norwegian producers and startups using side-streams for food or ingredients: spent coffee grounds, brewer spent grain, fruit/vegetables, seafood residuals, bakery streams, grains, dairy and urban side-streams. Distinguish pilot, commercial production, capacity and realized volume.

Gate: source-shortlist.

## CAR-006 - Circular Feed and Alternative Proteins

Map Norwegian actors in insects, mycoprotein, single-cell protein, seaweed, algae, feed ingredients and aquafeed. Start with Pronofa, Norinsect, Invertapro/Ecoprot, BIO3, Seaweed Solutions, the Norwegian seaweed cluster, Nofima/FHF projects. Mark founders/key people only when primary source exists.

Gate: source-shortlist / PCQ.

## CAR-007 - Biorest, Biogas, Digestat, Compost, Soil

Map actors connecting food waste, manure, fish sludge, biogas, digestate, compost, soil products and nutrient return. Start with Lindum, Greve Biogass/The Magic Factory, Cambi, ROAF/municipal waste actors, NIBIO/FHF sources. Distinguish waste handling from food production.

Gate: source-shortlist / PCQ.

## CAR-008 - Regenerative, Local, Small-Scale Practice Actors

Integrate the R12-ACTOR track: market gardens, CSA, REKO, KVANN, forest gardens, seed networks, small-scale vegetables and local value chains. Default all candidates to unverified until each has a primary locator. Do not mix network, producer and advisor rows.

Gate: actor-gate.

## CAR-009 - Innovation Ecosystem and Support Actors

Map startup environments, incubators, funds, research programs, foundations and public instruments that support circular food. Start with Innovation Norway, Research Council of Norway, Siva, Katapult, Ferd, Kavlifondet, Axfoundation as Nordic reference, Nofima/NIBIO/SINTEF. Do not present funding fit as actor impact.

Gate: internal / source-shortlist.

## CAR-010 - Founders, Key People, and Ownership Layer

Enrich Tier 1/Tier 2 actors with founders, key people, owners, investors and board/management links where primary source or registry source exists. Park person data when source is secondary, outdated or unclear. Do not collect private contact data.

Gate: actor-gate / PCQ.

## CAR-011 - Failure, Dormant, Bankruptcy and Survival Cases

Integrate the evidence pack for circular bankruptcies and restructuring cases. Mark status `active`, `pilot`, `dormant`, `restructured`, `bankrupt`, `acquired` or `unknown`. Distinguish technology viability from company outcome.

Gate: source-shortlist.

## CAR-012 - Final QC, Coverage Map, Export

Do not add new actors unless they come from an explicit gap list. Dedupe the registry, create coverage by category and region, sort `verified` vs `candidate`, and write a final status explaining what still cannot be called complete.

Outputs:
- `CAR-registry-verified.csv`
- `CAR-coverage-map.md`
- `CAR-final-report.md`

Gate: internal.

## Verification per batch

- CSV parser reads all rows.
- Required fields are present: `actor_id`, `canonical_name`, `source_class`, `gap_type`, `gate`, `registry_decision`.
- No `verified` row lacks strongest source.
- No `founders_or_key_people` without source basis.
- No unsafe AI-context truth flag appears in new CAR files.
- `git diff --check -- <new files>` is clean.
- `git status --short -- <new files>` shows expected unstaged/untracked files only.
- Main checkout is checked for accidental CAR files.
