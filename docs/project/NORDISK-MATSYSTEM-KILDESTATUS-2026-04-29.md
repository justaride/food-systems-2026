# Nordisk matsystem: kildestatus og databasegrad

**Dato:** 2026-04-29
**Status:** Operativ dekningsrapport
**Formål:** Svare konkret på om prosjektet allerede har grundige analyser og de beste rapportene om nordisk situasjon i matsystemet, og om dette ligger i databasen nå.

## Kort konklusjon

Ja, prosjektet har et solid nordisk kunnskapsgrunnlag i databasen og repoet. Det finnes allerede:

- komparative analyser av dagligvare, makt, regulering, selvforsyning og beredskap
- verdikjedeanalyser for primærproduksjon, foredling, distribusjon, innsatsvarer, HoReCa, matsvinn, sjømat og forbruk
- harmoniserte nordiske datasett for priser, handel og produksjon
- strukturerte `SourceDoc`- og `Report`-poster for flere sentrale eksterne rapporter

Etter reparasjon 2026-04-29 er fem av de viktigste nordiske kjerne-PDF-ene koblet fra `SourceDoc` til eksisterende `Document`. I tillegg er `Report`-koblingene for Nord 2024:007, Finland Food2030, Konkurrensverket 2025, Stockholm Resilience 2019 og NNR2023 reparert, og flere stale `evidence-pack/...` filstier er rettet til `research/evidence-pack/...`. Dekningen er likevel ikke ferdig kuratert som én masterpakke: enkelte duplikatrader krever kanonisk valg, noen PDF-er har lav tekstkvalitet, og bærekraftsdossieret fra 2026-04-28 ligger i repoet, men er ikke importert i `Document`-tabellen.

## Verifisert databasesituasjon

Read-only Postgres-sjekk 2026-04-29:

| Tabell | Rader |
|---|---:|
| `Document` | 1169 |
| `Report` | 175 |
| `SourceDoc` | 313 |
| `Thesis` | 78 |
| `Insight` | 122 |
| `Company` | 55438 |
| `Actor` | 191 |
| `CountryMetric` | 414 |

Nordisk relevante dokumentgrupper:

| Flate | Antall | Kommentar |
|---|---:|---|
| `bibliotek/nordisk` | 20 | Kuraterte nordiske notater og rapportoppsummeringer |
| `norden/verdikjede` | 11 | Full verdikjedeanalyse på tvers av Norden |
| `bibliotek/forskningsrunde-2026-04-20-r2` | 32 | Mange relevante, men flere er L4/uvalidert og må ikke løftes direkte til evidens |
| `bibliotek/sirkularitet` | 8 | Matsvinn, biogass, sirkularitet og policy |
| `evidence-pack/nordisk` | 11+ lokale filer | PDF-er og dokumenter for konkurranse, beredskap og marked |

Nordisk relevante `SourceDoc`-poster fra bred keyword-sjekk etter reparasjon:

| Type | Antall | Lenket til `Document` |
|---|---:|---:|
| `analyse` | 19 | 19 |
| `rapport` | 9 | 9 |
| `forskning` | 5 | 5 |
| `strategi` | 1 | 1 |
| `datasett` | 1 | 1 |
| `notat` | 1 | 1 |
| `soknad` | 1 | 1 |
| `academic-source` | 10 | 2 |
| `pdf-document` | 10 | 2 |

Tolkning: Den kuraterte nordiske analyse- og rapportflaten er i hovedsak importert/lenket. Gjenstående hull ligger mest i bred akademisk/PDF-backlog, inkludert generelle matsvinn- og Finland-kilder som ikke er kjernegrunnlaget for nordisk situasjonsanalyse.

## Beste interne analyser

| Prioritet | Fil | Bruk |
|---:|---|---|
| 1 | `research/norden/verdikjede/10-kryss-analyse.md` | Beste tverrgående analyse av makt, systemrisiko og flaskehalser i nordiske matsystemer |
| 2 | `research/norden/nordisk-komparativ-analyse.md` | Beste komparative analyse av dagligvarestruktur, HHI, konkurranse og selvforsyning |
| 3 | `research/norden/verdikjede/01-primaerproduksjon.md` til `08-forbruk.md` | Verdikjedepakke for produksjon, foredling, logistikk, innsatsvarer, HoReCa, matsvinn, sjømat og forbruk |
| 4 | `research/norden/nordic-analysis-panel-first-findings.md` | Første datafunn fra harmonisert nordisk panel |
| 5 | `research/data/nordic/analysis-panel/` | Datagrunnlag for HICP matpriser, handel og produksjon |
| 6 | `docs/project/mandates/research-dossiers/baerekraftsutfordringer-input-2026-04-28/` | Råinput for bærekraft per land og Norden; brukes som kildejakt, ikke siterbar evidens |

## Beste eksterne kjernegrunnlag

| Prioritet | Rapport/kilde | Lokal/DB-status | Bruk |
|---:|---|---|---|
| 1 | Stockholm Resilience Centre, `Nordic food systems for improved health and sustainability` (2019) | `Report` og `SourceDoc` er nå samlet på SourceDoc-støttet lokal PDF-`Document` | Baseline for nordisk matsystem, helse, miljø og EAT-Lancet-gap |
| 2 | Nordic Nutrition Recommendations 2023 | Full PDF er nå lastet ned, importert som `Document`, koblet til `SourceDoc` og lenket fra `Report` | Kosthold, helse og miljødimensjon i nordisk policy |
| 3 | NORMO 2025, `Nordic Monitoring 2014-2024` | `Report` er lenket til lokal note-`Document`; Appendix 6 workbook er arkivert og 57 `CountryMetric`-rader er upsertet | Faktisk kosthold, overvekt/fedme og sosial bærekraft |
| 4 | Nordregio/Nordic Council, `Policy tools for sustainable and healthy eating` (Nord 2024:007) | `SourceDoc` og `Report` er nå lenket til samme `Document` | Policyverktøy for etterspørselsendring og matmiljø |
| 5 | Nordic Council, `Breaking Barriers: Empowering Effective Food Waste Solutions in the Nordic Countries` (Nord 2024:034) | `SourceDoc` og `Report` er nå lenket til samme `Document` | Beste nordiske matsvinn-/tiltaksrapport |
| 6 | GFI Europe, `The Nordic alternative protein research ecosystem` | `SourceDoc` er nå lenket til `Document`; PDF er markert low-text i kvalitetsaudit | Forskning, finansiering og økosystem for alternative proteiner |
| 7 | SEI/Nordic Council, transboundary climate risks and Nordic trade/food security | Biblioteknotat finnes; full status bør sjekkes | Importavhengighet, klimarisiko og forsyningsresiliens |
| 8 | SOU 2024:8 `Livsmedelsberedskap för en ny tid` | `Report` finnes og er lenket | Svensk beredskapsmodell, ansvar, lager og forsyningsstruktur |
| 9 | Konkurrensverket 2024/2025 livsmedelsutredning | 2024-post er lenket og path-reparert; 2025-post er nå lenket til lokal PDF-`Document` | Svensk marked, konkurranse og etableringsbarrierer |
| 10 | KFST Salling/Coop 2025 | `Report` finnes, er lenket og path-reparert; én parallell beslutningsrad er fortsatt ulenket | Dansk markedskonsolidering og fusjonsanalyse |
| 11 | Finland Food2030 / Ruokastrategia | `Report` er nå lenket til lokal PDF-`Document` og path er reparert | Finsk matsystemstrategi og beredskap |

## Reparert kjerne-kø

Disse fem `SourceDoc`-radene er nå koblet til eksisterende `Document`-rader:

| SourceDoc | Tittel | Status |
|---|---|---|
| `src-food-8047a53676d7` | `Breaking Barriers: Empowering Effective Food Waste Solutions in the Nordic Countries` | `db-linked` |
| `src-food-d760f6d96053` | `Policy tools for sustainable and healthy eating` | `db-linked` |
| `src-food-dc5f1fd3d327` | `Stockholm Resilience Centre Report March 2019` | `db-linked`; kanonisk Report/Document-sti bør harmoniseres senere |
| `src-food-559ac48dbd62` | `The Nordic alternative protein research ecosystem - GFI Europe` | `db-linked`; low-text/OCR-forbehold |
| `src-food-17957bbc99a8` | `Policy commitment: Reducing food waste for a green Nordic Region` | `db-linked` |

Gjenstående ulenkede rader i den brede keyword-sjekken ligger primært i akademisk/PDF-backlog. Relevante eksempler er `Perspectives on sustainable food systems... Finland`, Luke/Jukuri, finsk matsvinnpraksis, EU food-waste-sider og HVK/security-of-supply. Disse bør ikke behandles som hull i kjernepakken før de er vurdert mot Food TG-claims.

## Bærekraftsdossieret 2026-04-28

`docs/project/mandates/research-dossiers/baerekraftsutfordringer-input-2026-04-28/` er nyttig, men må behandles riktig:

- DB-sjekk viser `0` `Document`-rader for denne mappen.
- README sier eksplisitt: `Ikke siterbart som primærkilde`.
- Bruksstatus: kildekart, hypotesegenerator og gap-liste.
- Det identifiserer 25+ manglende aktører, 15 manglende kilder, 10 nye fakta og 1 motsigelse rundt svensk HORECA-svinn.

Anbefaling: ikke importer dette som ordinær evidens. Importer eventuelt som `internal_synthesis` med tydelig `provenanceType`, eller behold det utenfor DB og bruk det til å fylle `source-shortlist-food-tg.md`, `claim-register-food-tg.md` og aktørkøer.

## Dekningsvurdering

| Spørsmål | Status | Kommentar |
|---|---|---|
| Har vi grundige analyser av nordisk situasjon i matsystemet? | Ja | Særlig `norden/` og `verdikjede/` er sterke. |
| Har vi beste rapporter og analyser i prosjektet? | Ja for kjernepakken, delvis for bred backlog | De viktigste er representert; fem sentrale `source-only`-kilder er nå koblet. |
| Har vi det i databasen nå? | Ja, men ikke komplett | DB har bred dekning; Salling/Coop-duplikatrad, gammel Stockholm-duplicate og bred akademisk/PDF-backlog gjenstår som rydding/review. |
| Er underlaget klart for ekstern bruk? | Delvis | Interne synteser må kobles til primærkilder før sterke claims. |
| Er bærekraftsdossieret importert? | Nei | Ligger i repoet og skal behandles som uvalidert råinput. |

## Anbefalt neste arbeidsøkt

1. Bruk `docs/project/mandates/nordic-core-sources-food-tg-2026-04-29.md` som styringsliste for ekstern brief.
2. Avklar gjenstående review i `docs/project/mandates/nordic-source-cleanup-process-2026-04-29.md`: `dk-salling-coop-decision-2025` og gammel Stockholm-duplicate.
3. Kryss hele `source-shortlist-food-tg.md` mot DB og marker hvert element som `db-linked`, `source-only`, `repo-only`, `static-only` eller `external-only`.
4. Lag en kort `Nordisk situasjon i matsystemet`-brief basert kun på `db-linked`/primærsjekkede kilder.
