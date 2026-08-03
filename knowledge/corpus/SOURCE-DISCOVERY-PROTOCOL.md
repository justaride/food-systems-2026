# Whole-system source-discovery protocol

Status: canonical internal working protocol

Version: 1.0.0

This protocol defines what Food Systems 2026 means by finding "everything available". It applies before source acquisition, identity verification and full-text analysis. A search result, candidate URL or downloaded file is not evidence and does not create subject-matter coverage.

## The bounded claim

The project may state that a named search universe was searched to its declared stopping rule at a stated time. It may not state that every relevant Nordic source has been found or that no unknown source exists.

Each search universe must bind all of the following:

- political geography or the separately governed, non-additive Sápmi scope;
- value-chain stages and analytical domains from the exact ontology version;
- institutions, registries, repositories, journals and other source systems in scope;
- source classes, languages, time range and update cadence;
- exact search, filter, navigation and pagination methods;
- inclusion, exclusion, deduplication and stopping rules;
- access, rights, language, technical and governance barriers;
- the time at which the search started and ended and the date by which it must be repeated.

The canonical macro planning surface currently contains 6,072 political-Nordic cells across eight political reporting scopes, 33 explicit stage units and 23 analytical domains. The overlapping Sápmi surface contains 759 separate cells. These are planning and gap-detection units, not claims that every cell needs its own document or that a document automatically covers a cell.

## Required search routes

Search-engine queries are only one route. A valid plan classifies every route below and enumerates an exact search obligation for each applicable route × source system × source class × language × cell combination:

1. official institution landing pages, publication lists, annual-report pages and document archives;
2. public registries, statistical tables, APIs, catalogues and legal databases;
3. university, research-institute and funder repositories;
4. bibliographic databases, journals, theses and conference repositories;
5. sector, company, cooperative, labour, civil-society and consumer sources;
6. municipal, regional, autonomous-territory and cross-border sources;
7. source references and citations discovered inside already acquired documents;
8. local, national and cross-Nordic searches in all declared languages and spelling variants;
9. rights-holder-led routes where Indigenous knowledge, Sápmi or other governed knowledge is in scope.

Navigation evidence matters. A document can be absent from a general publication list yet present under an institution's planning or reporting section. Therefore a negative web-search result is never sufficient negative evidence for an official institution.

## Search-run record

Every execution is append-only, binds exactly one declared search obligation and must record:

- universe ID and version;
- coordinator-observed start and end times;
- executor, tool or interface and any authentication boundary;
- exact query, URL, filters, sort order, language and pagination range;
- observed result count, inspected result count and whether the interface exposed a reliable total;
- landing pages and navigation paths inspected;
- candidate source IDs and canonical locators discovered;
- exclusions with enumerated reasons;
- access failures, robots exclusions, unavailable pages and unresolved applicability questions;
- captured search-page or API-response hashes where lawful and technically possible;
- result state: `completed`, `partial`, or `blocked` for that exact obligation;
- limitations, next actions and `repeatNoLaterThan`.

A run cannot claim that the whole plan is complete. A separate append-only completion assessment may record `stopping_rule_met` only when it binds one exact, earlier, completed run hash for every declared obligation. The assessment fails if an obligation is missing, duplicated, cross-plan or incomplete.

`stopping_rule_met` means only that the declared obligations were completed for that universe and time window. It has no evidence, review, publication or coverage implication. Discovery v1 cannot authenticate rights-holder authority or consent, so a Sápmi assessment remains incomplete until an external governance-verification contract is available.

## Candidate separation

Discovery, acquisition and knowledge processing are separate records:

```text
search-run result
  -> discovery candidate
  -> exact acquisition receipt and retained bytes or reproducible structured response
  -> database source identity
  -> technical extraction
  -> verified source identity
  -> full-text analysis and reconciliation
  -> owner and any required independent review
  -> separate rights, publication and coverage decisions
```

A discovery candidate must carry `candidate_only`, `externalUseAllowed: false` and `coveragePromotionAllowed: false`. It must not copy a search-result snippet into the knowledge base as a factual claim. Candidate deduplication may group identical URLs, identifiers or byte hashes, but may not silently merge distinct source identities.

## Document-led expansion

Full-text analysis must return every cited, referenced or explicitly implied follow-up source that is necessary to understand or test the document. Those leads re-enter discovery as candidates with the originating source, exact locator and reason preserved. They do not bypass acquisition or identity verification.

This creates a controlled recursive process:

1. search the declared universe;
2. acquire and process the included sources;
3. register source-led references and gaps;
4. search and process the new candidates;
5. repeat until the stopping rule is met and no unresolved in-scope lead remains for that run;
6. schedule the next search window.

## Geography and governance boundaries

- Denmark, Finland, Iceland, Norway, Sweden, the Faroe Islands, Greenland and Åland remain distinct political reporting scopes.
- Sápmi is overlapping and non-additive. Its search universe, inclusion logic, consent requirements and interpretation route must be rights-holder-led before substantive completeness or coverage can be assessed. An authorization-receipt hash inside discovery v1 is recorded but unverified and cannot unlock a stopping-rule claim.
- Nordic, EU, EEA, Arctic, Baltic and global sources are context layers. They must not be silently counted as evidence for a national or autonomous-territory cell.
- Whole-country values that include an autonomous territory remain non-additive with a separately reported territory value until the boundary is reconciled.

## Current operational boundary

Processing the current corpus is necessary but insufficient. The 1,555 active identities and 1,467 deduplicated processing units describe the present database inventory. New discovery runs can and should add candidate sources, while the baseline remains immutable and each addition is recorded as a later intake event.

The project therefore reports at least four acquisition numbers separately:

1. active identities in the frozen baseline;
2. discovery candidates not yet acquired;
3. acquired candidates awaiting controlled database registration;
4. registered identities added after the baseline.

None of these numbers is a proxy for full-text processing or subject-matter coverage.
