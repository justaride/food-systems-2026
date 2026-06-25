# CAR-006 Alternative Protein and Circular Feed Actor Memo

Status: first-pass data collection
Date: 2026-06-24
Scope: Norway-first actor registry enrichment for alternative protein, insect protein, mycoprotein/fermentation, seaweed/kelp inputs and circular feed R&D.

## What Was Collected

This batch turns the alternative-protein seed queue into a sourced registry delta rather than a narrative list. The delta keeps company rows, network rows and project rows separate:

- Company rows ready for verified import after final QC: Pronofa ASA, NorInsect AS, Invertapro AS, Seaweed Solutions AS and Arctic Seaweed AS.
- Company rows ready for candidate enrichment but not full verified export: BIO3 AS, Norwegian Mycelium AS / NoMy and Felleskjopet Forutvikling AS.
- Network/project context rows: Norwegian Seaweed Cluster, MultiFuelLarve, Millennial Salmon and Algae2Insect.
- Nordic context row: Enifer PEKILO Aqua, useful for feed/mycoprotein context but not Norwegian coverage.

## Strongest Findings

Pronofa is currently best sourced as a tunicate/Ciona alternative-protein actor through its own site and Brreg identity. The old seed row framed Pronofa mainly as insect protein; that should be split or rewritten because the current primary source foregrounds Ciona/Purply.

NorInsect has a strong actor-primary source for mealworm production, low-value residues, feed ingredients, oil and frass. It is also the only row in this batch where founder/key-person data was imported because the founder statement is on the actor's own site.

Invertapro has a strong actor-primary source for food waste and organic side-streams to insect production, feed/food product development and frass fertilizer. Current volume and LCA claims still need their underlying documents before being used as registry KPIs.

BIO3 is a credible Norwegian fermentation/feed candidate with Brreg identity and an actor site. The WA3RM WTL Averoy page supports the facility concept and circular feed logic, but capacity and production status must remain planned/pre-commercial until production-start evidence is found.

Seaweed Solutions and Arctic Seaweed have strong identity and primary-source fit as seaweed/kelp value-chain actors. Their rows should not be overclaimed as direct food or feed producers unless the end-use source is actor-specific.

## Key Gaps

- Ecoprot did not return a direct Brreg hit in the simple query. It should be handled as acquired/legacy only after a primary Pronofa or legal source is read.
- NoMy's official site was not extractable in this pass. Keep side-stream, funding and founder details parked behind primary confirmation.
- Felleskjopet Forutvikling has a Brreg match and strong thematic relevance but should be treated as R&D/support until a direct actor page is extracted.
- Borregaard was left out of the delta despite Brreg match because the batch did not find a specific enough food/feed alternative-protein link.
- Mattilsynet regulation pages should be used as context for feed-substrate constraints, not as actor-impact proof.

## Import Recommendation

Import the five strongest company rows into `CAR-registry-verified.csv` only after final dedupe against the existing candidate IDs:

- `car-no-pronofa-asa` should replace or supersede `car-no-pronofa-as`.
- `car-no-norinsect-as` can enrich the existing seed row.
- `car-no-invertapro-as` is a new row in the current candidate CSV and should be added.
- `car-no-seaweed-solutions-as` can enrich the existing Seaweed Solutions seed line.
- `car-no-arctic-seaweed-as` can enrich the existing Arctic Seaweed seed line.

Keep BIO3, NoMy and Felleskjopet Forutvikling as enriched candidates until production status, official technology details and direct actor pages are stronger.

## Ikke-Si Rules Added By This Batch

- Do not use planned feed-protein capacity as realized production.
- Do not classify seaweed technology/service actors as food producers without end-use evidence.
- Do not count research projects as producer capacity.
- Do not import founder/key-person data from secondary startup press.
- Do not treat regulations or mission targets as actor impact.
