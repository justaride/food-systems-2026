# Whole-corpus source-analysis protocol

Status: canonical internal working protocol

Version: 1.0.0

This protocol defines what it means for Gabriel Freeman and AI to have worked through one source in Food Systems 2026. It applies to PDFs, office documents, web captures, database records, transcripts, datasets and internal synthesis material. It does not turn an AI draft into reviewed evidence, publication permission or researched coverage.

## One source, one auditable chain

```text
exact source identity and bytes
  -> technical extraction with page or record boundaries
  -> AI reading and structured candidate analysis
  -> reconciliation with existing sources, claims and entities
  -> Gabriel owner review for the declared internal use
  -> independent, partner or rights-holder validation when the use requires it
  -> separate rights, publication and coverage decisions
  -> compiled database, wiki, Obsidian and platform projections
```

Every arrow needs a receipt. A later step may use only the exact output hash from the preceding step. A filename, word count, stored summary, triage card or successful OCR run is never proof that the source was read and understood.

The executable workflow contracts are [source identity verification v1](workflows/source-identity-verification-v1.md) and [full source analysis v1](workflows/source-analysis-v1.md). Their separate canonical prompt templates are [source identity prompt v1](workflows/source-identity-verification-prompt-v1.md) and [full source-analysis prompt v1](workflows/source-analysis-prompt-v1.md). Each run must bind the exact ID, version, repository path and file hash of both the workflow and its prompt template; a similarly named ad-hoc prompt is not the same execution.

## When full-text AI processing is complete

A source can be marked `full_text` only when all of the following are true:

1. the source identity and input-byte hash are fixed;
2. every expected page, slide, sheet, transcript segment or record is represented in the input manifest;
3. extraction warnings and low-text or image-only units have been inspected and either resolved or recorded as limitations;
4. the AI run records its exact input manifest, workflow bytes, prompt-template bytes, every ordered normalized-unit byte and available model identity, and explicitly says when the runtime does not expose an exact model build;
5. the output artifact is hash-bound to that run and contains the required sections below;
6. the output passes structural and cross-reference checks;
7. no page or record is silently skipped;
8. unresolved identity, scope or extraction problems remain open blockers.

Technical extraction alone does not satisfy this definition. Full-text completion also does not imply owner acceptance, factual validation, rights clearance, external use or coverage promotion.

## Required analysis of each source

Each source-analysis artifact must record:

- exact source identity, title, publisher or author, date, language, URL or private locator, raw-content hash and extraction receipt;
- whether the source is primary evidence, internal synthesis, generated projection, operational control or outside the project scope, with the role remaining provisional until owner confirmation;
- a bounded summary of the source's purpose, method, population or universe, geography, period and system boundary;
- claim candidates with a paraphrased proposition, claim type, exact page or record locator, supporting page-text hash, limitations and machine confidence;
- quantitative observation candidates with value, unit, numerator, denominator or universe, geography, period, method, uncertainty and exact locator;
- actor, institution, policy, infrastructure, commodity, material, process, ownership and relationship candidates, without merging identities by name alone;
- affected value-chain functions, analytical domains, circular strategies, flows and outcomes as ontology-link candidates rather than confirmed coverage;
- definitions and terms that need concept records or cross-language reconciliation;
- support, challenge, contradiction and supersession candidates against existing knowledge;
- source-specific limitations, sampling risks, missing data, conflicts of interest and statements that the source cannot support;
- gaps and concrete follow-up actions, including other sources the document says should exist;
- proposed links to existing claims, observations, entities, coverage cells and synthesis pages;
- an explicit statement of what was not assessed or could not be extracted.

The tracked v1 source-analysis artifact contains paraphrases and exact locators, not quotations or retained source text. If a later controlled translation or quotation artifact is needed to audit interpretation, it must remain separate, identify its method and pass the applicable rights rules before reuse.

The stable corpus title and the title observed in a document are distinct fields. A verified normalized title match is accepted only when a deterministic dimension-specific rule produces the same ordered title tokens; a free-form AI explanation cannot turn unrelated titles into the same identity.

## Reconciliation is part of processing

Reading a source is not finished when a standalone summary exists. The analysis must compare its candidates with the current knowledge base:

- reuse a stable identity only after the identity binding is verified;
- connect equivalent, narrower, broader or differently bounded claims instead of creating silent duplicates;
- keep incompatible measurements separate until geography, period, unit, universe and method are harmonized;
- retain contradictions visibly rather than choosing a convenient value;
- update every affected entity, concept, comparison, gap and synthesis candidate in the dry-run change set;
- never use an internal synthesis as a substitute for the primary source it cites.

## Review and authority

Gabriel may accept an exact AI-assisted work package for its declared internal project use through an owner-review receipt. That receipt must disclose the AI runs used. It is Gabriel's project decision, not independent expert validation.

Independent experts, partners and rights-holders are separate roles. Their validation is required only where the material, claim, geography or intended use calls for their expertise or authority, but it can never be fabricated or inferred. Sápmi and Indigenous knowledge remain on a rights-holder-led, consent- and governance-bound route.

Rights clearance, privacy, safety, legal review, publication approval and coverage assessment remain separate decisions. None follows automatically from full-text processing or owner review.

## Batch rules

- The processing unit is the unique content hash. Duplicate identities share technical and AI reading work but keep separate identity and owner-review decisions.
- Batches must be small enough that every source can be inspected and failures can be isolated.
- A failed source cannot partially publish a success receipt.
- Batch manifests list exact inputs and expected outputs; the generation manifest is written last.
- Portable checks validate tracked metadata. Full private checks additionally verify controlled source and extracted-text copies without placing private paths or content in Git.
- Reading one controlled private source copy for identity replay does not promote the lifecycle claim to `private_live_verified`. That stronger state requires a separately designed and receipted live verification of the required private copies.
- Progress reporting distinguishes pages extracted, sources AI-read, identities owner-reviewed, externally validated items and coverage-promoted cells.

## Exhaustive acquisition boundary

"Everything available" is meaningful only against a named search universe. For each geography and subject area, the acquisition log must record:

- institutions, registries, journals, repositories, languages and source classes searched;
- queries, filters, dates, result counts and inclusion or exclusion rules;
- known access barriers, unavailable sources and rights restrictions;
- deduplication keys and update cadence;
- negative-search evidence and the date on which the search must be repeated.

The project may say a search universe was exhausted at a stated time. It may not claim that no unknown source exists.

The required routes, append-only search-run semantics, recursive document-led expansion and political-versus-Sápmi boundaries are defined in [SOURCE-DISCOVERY-PROTOCOL.md](SOURCE-DISCOVERY-PROTOCOL.md).

## Promotion stopline

The following counts must remain independent:

1. corpus identities registered;
2. unique source bytes available;
3. technical extraction complete;
4. full-text AI analysis complete;
5. source role owner-confirmed;
6. owner review complete;
7. independent, partner or rights-holder validation complete where required;
8. rights and publication decisions complete;
9. coverage cells promoted for a named readiness profile.

No count may be used as a proxy for a later one.
