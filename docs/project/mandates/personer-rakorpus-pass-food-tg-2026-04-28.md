---
tittel: "Personer råkorpus-pass - Food TG"
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-28
neste_handling: Valider HIGH-kandidater manuelt mot kildekontekst og promoter bare bekreftede personer til PersonProfile eller ActorContact.
relaterte_filer:
  - scripts/audit-person-raw-corpus.ts
  - research/_status/person-korpus-kandidater-2026-04-28.json
  - research/_status/person-korpus-kandidater-2026-04-28.csv
  - docs/project/mandates/personer-underlagskontroll-food-tg-2026-04-28.md
---

# Personer råkorpus-pass - Food TG

> Auto-generert av `scripts/audit-person-raw-corpus.ts`. Dette er en kandidat-/triageliste, ikke en importliste.

## Konklusjon

Råkorpuspasset skannet `960` tekstfiler fra `docs/meetings`, `docs/project/mandates` og `research` mot eksisterende `/personer`-grunnlag. Scriptet fant `764` personnavn-kandidater med rolle-/kontaktkontekst. `40` matcher allerede personsiden, mens `724` må vurderes før eventuell strukturering.

Viktig: dette er regex-/kontekstbasert NER-light. Kandidater må bekreftes mot kilde før de blir fakta i databasen.

## Status

| Kategori | Antall | Bruk |
| --- | --- | --- |
| Allerede på /personer | 40 | Ingen import |
| Trenger vurdering | 724 | Kandidatko |
| HIGH | 33 | Valider først |
| MEDIUM | 79 | Valider etter HIGH |
| LOW | 612 | Parker til senere |
| ActorContact, ikke /personer | 15 | Avklar modellskille |
| Meeting participant, ikke /personer | 8 | Avklar om relevant personprofil |

## Toppkandidater

| Prioritet | Status | Navn | Mentions | Kilder | Score | Kildeeksempler |
| --- | --- | --- | --- | --- | --- | --- |
| HIGH | actor_contact_only | Bent Hoeie | 8 | 5 | 65 | ActorContact; research/bibliotek/nou/matsystemutvalget-status-2026.md; research/bibliotek/tenketanker-ngo.md |
| HIGH | missing_candidate | Michel Bajuk | 9 | 7 | 54 | research/RESEARCH-MISSIONS.md; research/analyse/CRITICAL-PROJECT-REVIEW-2026-03-25.md; research/external/nch-contract/contract-201-2503-P25013.md |
| HIGH | missing_candidate | Betina Simonsen | 8 | 7 | 53 | research/RESEARCH-MISSIONS.md; research/analyse/CRITICAL-PROJECT-REVIEW-2026-03-25.md; research/external/nch-contract/contract-201-2503-P25013.md |
| HIGH | missing_candidate | Frode Steen | 8 | 7 | 53 | research/bibliotek/akademia/nhh-food/frode-steen-profil.md; research/interviews/nordisk-aktorkart-perplexity-2026.md; research/ocr-output/arkiv-sortert__Food Research Process 20.04.26__07_Academic_Research_And_Theses__drager-og-vagene.md |
| HIGH | missing_candidate | Paola Federica Albizzati | 7 | 7 | 42 | research/bibliotek/akademia/masteroppgaver/albizzati-phd-2021.md; research/intake/food-research-process-2026-04-20/promotion-candidates.csv; research/intake/food-research-process-2026-04-20/promotion-preview-thesis.csv |
| HIGH | actor_contact_only | Hanne Fjerdingby Olsen | 4 | 2 | 34 | ActorContact; research/cathrine-ten-step-oppsummering.md |
| HIGH | missing_candidate | Minna Kaljonen | 5 | 3 | 34 | research/bibliotek/nordisk-mat-tenkere.md; research/interviews/nordisk-aktorkart-perplexity-2026.md; research/perpl-17-03/Nordisk aktørkart for matsystemkartlegging 2026.md |
| HIGH | actor_contact_only | Nils Kristen Sandtroen | 4 | 2 | 32 | ActorContact; research/interviews/nordisk-aktorkart-perplexity-2026.md |
| HIGH | missing_candidate | Antonia Ax:son Johnson | 4 | 4 | 32 | research/bibliotek/forskningsrunde-2026-04-20/ax-foundation-kartlegging-2026-04-20.md; research/bibliotek/forskningsrunde-2026-04-20-r2/p15-axel-johnson-systemet-2026-04-20.md; research/intake/perplexity-2026-04-20/new-actors.json |
| HIGH | missing_candidate | Carsten Lind Pedersen | 4 | 4 | 32 | research/evidence-pack/sirkular-konkurser/enorm-biofactory/media-thefishsite-2025.md; research/exa-circular-actors-2026-04-21.md; research/perplexity-20-04-26/konkursanatomi-enorm-mycorena-infarm-v2.md |
| HIGH | actor_contact_only | Kristian S. Ottesen | 3 | 1 | 28 | Royal Greenland |
| HIGH | actor_contact_only | Alexandra Leeper | 3 | 1 | 28 | Iceland Ocean Cluster |
| HIGH | actor_contact_only | Michaela Lindstrom | 3 | 1 | 28 | Hailia Nordic |
| HIGH | actor_contact_only | Karin Beukel | 3 | 1 | 28 | Agrain |
| HIGH | actor_contact_only | Linn Indrestrand | 3 | 1 | 28 | Danish Ocean Cluster |
| HIGH | actor_contact_only | Monika Poulsen | 3 | 1 | 28 | Arctic Cluster Team |
| HIGH | actor_contact_only | Anja Loekken Stokke | 3 | 1 | 28 | NCE Heidner Biocluster |
| HIGH | actor_contact_only | Gurill Narum Mediaa | 3 | 1 | 28 | NCE Heidner Biocluster |
| HIGH | actor_contact_only | Selina Juul | 3 | 1 | 28 | Stop Spild Af Mad |
| HIGH | actor_contact_only | Mattias Lindahl | 3 | 1 | 28 | Linkoeping University |
| HIGH | missing_candidate | Ramkumar Nair | 4 | 3 | 27 | research/bibliotek/forskningsrunde-2026-04-20-r2/p18-insektindustri-norden-2026-04-20.md; research/evidence-pack/sirkular-konkurser/mycorena/analysis-mycostories.md; research/evidence-pack/sirkular-konkurser/mycorena/media-vegconomist-2024.md |
| HIGH | missing_candidate | Tom Johansson | 4 | 2 | 26 | research/evidence-pack/sirkular-konkurser/hooked-foods/media-ppti.md; research/evidence-pack/sirkular-konkurser/hooked-foods/media-vegconomist.md |
| HIGH | missing_candidate | Mona Mortensen Krane | 4 | 2 | 26 | research/evidence-pack/stortinget/innst-130s-2025-2026.md; research/evidence-pack/stortinget/innst-173s-2023-2024.md |
| HIGH | actor_contact_only | Thea Simone Ingvaldsen | 3 | 1 | 24 | ActorContact |
| HIGH | actor_contact_only | Martin Saetra | 3 | 1 | 24 | ActorContact |
| HIGH | missing_candidate | Peppi Segersven | 4 | 4 | 24 | research/bibliotek/MASTER-PHD-BACKLOG-2026.md; research/intake/food-research-process-2026-04-20/promotion-preview-thesis.csv; research/intake/food-research-process-2026-04-20/promotion-preview-thesis.json |
| HIGH | missing_candidate | Kari Juntunen | 3 | 3 | 24 | research/bibliotek/forskningsrunde-2026-04-20/roal-oy-enzymer-finland-2026-04-20.md; research/intake/perplexity-2026-04-20/new-actors.json; research/perplexity-20-04-26/rolaere-finland-sirkulaer-for.md |
| HIGH | missing_candidate | Jarna Hyvönen | 3 | 3 | 24 | research/bibliotek/forskningsrunde-2026-04-20-r2/p17-volare-selskapsdossier-2026-04-20.md; research/evidence-pack/sirkular-konkurser/enorm-biofactory/analysis-sifted-ynsect.md; research/exa-circular-actors-2026-04-21.md |
| HIGH | missing_candidate | Simen Aardal Ulsaker | 3 | 3 | 24 | research/bibliotek/nordisk-mat-tenkere.md; research/interviews/nordisk-aktorkart-perplexity-2026.md; research/perpl-17-03/Nordiske avhandlinger og masteroppgaver om matsystemer, dagligvare og matpolitikk (2010–2026).md |
| HIGH | missing_candidate | Helena Hansson | 3 | 2 | 21 | research/interviews/nordisk-aktorkart-perplexity-2026.md; research/perpl-17-03/Nordisk aktørkart for matsystemkartlegging 2026.md |
| HIGH | missing_candidate | Nesli Sozer | 3 | 2 | 21 | research/interviews/nordisk-aktorkart-perplexity-2026.md; research/perpl-17-03/Nordisk aktørkart for matsystemkartlegging 2026.md |
| HIGH | missing_candidate | Annikka Hurme | 3 | 2 | 21 | research/interviews/nordisk-aktorkart-perplexity-2026.md; research/perpl-17-03/Nordisk aktørkart for matsystemkartlegging 2026.md |
| HIGH | missing_candidate | Erling Hjelmeng | 3 | 2 | 19 | research/RESEARCH-AUDIT.md; research/bibliotek/nou-stortingsdok-juridisk.md |

## ActorContact uten /personer-profil

| Navn | Mentions | Kildeeksempler | Handling |
| --- | --- | --- | --- |
| Bent Hoeie | 8 | ActorContact; research/bibliotek/nou/matsystemutvalget-status-2026.md; research/bibliotek/tenketanker-ngo.md | decide_promote_to_person_profile_or_keep_actor_contact |
| Hanne Fjerdingby Olsen | 4 | ActorContact; research/cathrine-ten-step-oppsummering.md | decide_promote_to_person_profile_or_keep_actor_contact |
| Nils Kristen Sandtroen | 4 | ActorContact; research/interviews/nordisk-aktorkart-perplexity-2026.md | decide_promote_to_person_profile_or_keep_actor_contact |
| Kristian S. Ottesen | 3 | Royal Greenland | decide_promote_to_person_profile_or_keep_actor_contact |
| Alexandra Leeper | 3 | Iceland Ocean Cluster | decide_promote_to_person_profile_or_keep_actor_contact |
| Michaela Lindstrom | 3 | Hailia Nordic | decide_promote_to_person_profile_or_keep_actor_contact |
| Karin Beukel | 3 | Agrain | decide_promote_to_person_profile_or_keep_actor_contact |
| Linn Indrestrand | 3 | Danish Ocean Cluster | decide_promote_to_person_profile_or_keep_actor_contact |
| Monika Poulsen | 3 | Arctic Cluster Team | decide_promote_to_person_profile_or_keep_actor_contact |
| Anja Loekken Stokke | 3 | NCE Heidner Biocluster | decide_promote_to_person_profile_or_keep_actor_contact |
| Gurill Narum Mediaa | 3 | NCE Heidner Biocluster | decide_promote_to_person_profile_or_keep_actor_contact |
| Selina Juul | 3 | Stop Spild Af Mad | decide_promote_to_person_profile_or_keep_actor_contact |
| Mattias Lindahl | 3 | Linkoeping University | decide_promote_to_person_profile_or_keep_actor_contact |
| Thea Simone Ingvaldsen | 3 | ActorContact | decide_promote_to_person_profile_or_keep_actor_contact |
| Martin Saetra | 3 | ActorContact | decide_promote_to_person_profile_or_keep_actor_contact |

## Medium-kandidater

| Navn | Status | Mentions | Kilder | Kildeeksempler |
| --- | --- | --- | --- | --- |
| Einar Kleppe Holthe | meeting_participant_only | 12 | 7 | Transition Groups — Kapasiteter og roller; Prosjektoppstart Food Systems TG |
| Jan Thomas Odegard | meeting_participant_only | 15 | 10 | Transition Groups — Kapasiteter og roller; JT + Gabriel — R9-rammeverk, sirkularitetssporsmal og for |
| Gabriel Freeman | meeting_participant_only | 19 | 11 | Oppstart og dokumentgjennomgang; Transition Groups — Kapasiteter og roller |
| Martin Hagen | meeting_participant_only | 13 | 7 | Oppstart og dokumentgjennomgang; Prosjektoppstart Food Systems TG |
| Cathrine Barth | meeting_participant_only | 12 | 8 | Transition Groups — Kapasiteter og roller; TG-metodikk og strategisk retning |
| Thea Martinsen | meeting_participant_only | 12 | 8 | Transition Groups — Kapasiteter og roller; Transition Groups — Mandat, scoping, aktorkartlegging og plattformstatus |
| Jan Thomas | meeting_participant_only | 8 | 4 | docs/meetings/MØTEOVERSIKT.md; docs/project/mandates/decision-log-food-tg.md |
| Kristian Johnsrud | meeting_participant_only | 6 | 4 | Transition Groups — Kapasiteter og roller; Transition Groups — Mandat, scoping, aktorkartlegging og plattformstatus |
| Metro State | missing_candidate | 2 | 2 | docs/meetings/CITIES AND FOOD - Markedsmøte 16-03.md; docs/meetings/Strategisk ledergruppe Marked 16 mars 2026.md |
| Alexandra Mörner | missing_candidate | 2 | 2 | research/bibliotek/forskningsrunde-2026-04-20/ax-foundation-kartlegging-2026-04-20.md; research/perplexity-20-04-26/ax-foundation-matsystem-program.md |
| Maria Smith | missing_candidate | 2 | 2 | research/bibliotek/forskningsrunde-2026-04-20/ax-foundation-kartlegging-2026-04-20.md; research/perplexity-20-04-26/ax-foundation-matsystem-program.md |
| Roals FoU | missing_candidate | 2 | 2 | research/bibliotek/forskningsrunde-2026-04-20/roal-oy-enzymer-finland-2026-04-20.md; research/perplexity-20-04-26/rolaere-finland-sirkulaer-for.md |
| Margareth Øverland | missing_candidate | 2 | 2 | research/bibliotek/forskningsrunde-2026-04-20-r2/p05-nordiske-forskningsprogrammer-2026-04-20.md; research/bibliotek/forskningsrunde-2026-04-20-r2/p49-phd-prosjekter-norden-2026-04-20.md |
| Alltech Fennoaqua | missing_candidate | 2 | 2 | research/bibliotek/forskningsrunde-2026-04-20-r2/p17-volare-selskapsdossier-2026-04-20.md; research/intake/perplexity-2026-04-20-runde2/new-actors.json |
| ETH Zürich | missing_candidate | 2 | 2 | research/bibliotek/forskningsrunde-2026-04-20-r2/p26-helsingborg-recolab-2026-04-20.md; research/rammeverk/perplexity-promptpack-møte7-2026-04-20.md |
| Kilder: NSVA | missing_candidate | 2 | 2 | research/bibliotek/forskningsrunde-2026-04-20-r2/p26-helsingborg-recolab-2026-04-20.md; research/rammeverk/perplexity-promptpack-møte7-2026-04-20.md |
| Nordvästra Skånes VA | missing_candidate | 2 | 2 | research/bibliotek/forskningsrunde-2026-04-20-r2/p26-helsingborg-recolab-2026-04-20.md; research/rammeverk/perplexity-promptpack-møte7-2026-04-20.md |
| IVL Svenska Miljöinstitutet | missing_candidate | 2 | 2 | research/bibliotek/forskningsrunde-2026-04-20-r2/p26-helsingborg-recolab-2026-04-20.md; research/rammeverk/perplexity-promptpack-møte7-2026-04-20.md |
| Forskning: NMBU | missing_candidate | 2 | 2 | research/bibliotek/forskningsrunde-2026-04-20-r2/p47-regenerativt-landbruk-norden-2026-04-20.md; research/rammeverk/perplexity-promptpack-møte7-2026-04-20.md |
| Kilder: Regenerative Nordics | missing_candidate | 2 | 2 | research/bibliotek/forskningsrunde-2026-04-20-r2/p47-regenerativt-landbruk-norden-2026-04-20.md; research/rammeverk/perplexity-promptpack-møte7-2026-04-20.md |
| Line Gordon | missing_candidate | 2 | 2 | research/bibliotek/nordisk-mat-tenkere.md; research/interviews/nordisk-aktorkart-perplexity-2026.md |
| Helgi Eyleifur | missing_candidate | 2 | 2 | research/bibliotek/nordisk-mat-tenkere.md; research/evidence-pack/beredskap/beredskap-island-melmolle-2025.md |
| Ivar Gaasland | missing_candidate | 2 | 2 | research/bibliotek/tenketanker-ngo.md; research/interviews/nordisk-aktorkart-perplexity-2026.md |
| Quality Controller Key Account Manager | missing_candidate | 2 | 2 | research/evidence-pack/beredskap/beredskap-island-melmolle-2025.md; research/evidence-pack/sirkular-konkurser/plantagon/media-hortidaily.md |
| Om Helsedirektoratet Om | missing_candidate | 2 | 2 | research/evidence-pack/bransje/forbrukerradet-matsikkerhet-2026.md; research/evidence-pack/offentlig/helsedirektoratet-skolemaltid-2024.md |

## Bruksregler

1. Ikke importer kandidater automatisk.
2. For HIGH: åpne kildekontekst i JSON/CSV, bekreft at navnet er en person og at rollen er relevant for Food TG.
3. Hvis personen er aktørkontakt: vurder `ActorContact` først, `PersonProfile` bare hvis rollen skal inn i person-/interlocking-katalogen.
4. Hvis personen er møte-/intern deltaker: promoter bare hvis personen skal ha ekstern eller operativ rolle i underlaget.
5. Etter manuell validering: oppdater importscript eller seeddata, kjør personimport og deretter `scripts/audit-person-underlag.ts` på nytt.
