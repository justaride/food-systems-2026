# Bibliotek og gjenstående arbeid — fortsettelse 001

Alle **392 poster** i det bevarte produksjonsuttrekket er gjennomgått videre. **140 ulike PDF-filer** er tekstuttrukket, bundet til **9919 fysiske sider** og kontrollert visuelt på førstesiden. **147 poster har en PDF-assosiasjon**, hvorav **138 har minst én dokumentkandidat med avgrenset, forenlig identitet**. Dette er klargjøring for faglig lesing; ingen produksjonspost er godkjent eller endret.

De 187 lokale filene er 97 PDF-er, 86 Markdown-notater og fire tekstfiler. Den første innhentingen forsøkte 271 nettadresser. Tre gzip-komprimerte årsrapporter er dekodet med både overføringshash og PDF-hash bevart. 176 referanser til 59 adresser var funnet ved feilaktig teksttolking av binære PDF-er. Disse er holdt utenfor de gjeldende postkoblingene; selve PDF-ene er behandlet direkte. Blant referansene er 61 treff på én teknisk RDF-adresse. De øvrige kan være innbakte lenker, men er ikke bekreftet som originalkilder til posten. Dette er en rettelse av innhentingen, ikke et funn av 176 feil i databasen. Den opprinnelige innhentingsloggen er bevart som historikk.

| Gjeldende lokal disposisjon | Poster | Neste handling |
|---|---:|---|
| access_failed_or_denied | 22 | Innhent tilgjengelig autorisert original, eller dokumenter historisk/utilgjengelig kilde. |
| different_document_or_edition_only | 4 | Finn originalen for riktig verk og år. Ikke erstatt med annet dokument eller annen årgang. |
| html_available_identity_unresolved | 75 | Identifiser konkret side og versjon før faglig bruk. |
| internal_context_candidate_only | 4 | Behold internt; vurder dokumentets rolle. Arbeidsnotat og e-post er ingen godkjenning. |
| no_explicit_original_available | 147 | Identifiser originalen fra notat/tittel eller innhent fil fra eier. |
| pdf_identity_candidate_available | 138 | Kontroller eksakt postbinding og gjennomfør kildeavgrenset faglig lesing. Ingen automatisk import. |
| pdf_title_identity_unresolved | 1 | Kontroller tittelside eller autoritativ katalog mot den eksakte filen. |
| structured_search_not_unique_document | 1 | Skaff entydig original; registerets søketreff identifiserer ikke automatisk riktig kilde. |

Disposisjonene summerer til 392 og er ingen ferdigprosent. Alle 392 produksjonsposter er uendret.

## Feil dokument eller årgang

| Kandidat | Observert dokument | Registrert kobling |
|---|---|---|
| LIB-20260909-CONT001-013 | The Greenhouse Gas Protocol — A Corporate Accounting and Reporting Standard, Revised Edition | Impacts of data-driven demand forecasting in reducing food waste and CO2 emissions in campus restaurants |
| LIB-20260909-CONT001-017 | Konkurransen i Norge | Hemmelige kontrakter i dagligvaremarkedet |
| LIB-20260909-CONT001-044 | Social and economic impact of COVID-19 | Food supply chain resilience to pandemics: A rapid review |
| LIB-20260909-CONT001-048 | A National Food Strategy for Sweden — Short version of Government bill 2016/17:104 | Learning for Crisis: Improving food security in Uppsala County through participative localized food production |
| LIB-20260909-CONT001-052 | Kommersielt tilgjengelige torvfrie råvarer til dyrkingsmedier | Kartlegging av dagens bruk og fremtidig potensial for organisk avfall som gjødsel og jordforbedring (Norwaste-rapport 3-2019) |
| LIB-20260909-CONT001-073 | God handelsskikk i dagligvarekjeden | Arsrapporter 2021; NOU 2013:6 God handelsskikk |
| LIB-20260909-CONT001-084 | Curriculum Vitae — Øystein Foros | Vertical Integration and Market Power: Lessons from Media for Grocery |
| LIB-20260909-CONT001-114 | Elintarvikemarkkinavaltuutetun toimintakertomus 2023 | etmv toimintakertomus 2024 |
| LIB-20260909-CONT001-130 | Circularity in Europe strengthens the sustainability of the global food system | Konkurransetilsynets rapport (src-73) |
| LIB-20260909-CONT001-131 | Samarbeidsklimaet i dagligvarebransjen — Rapport fra undersøkelse blant kjeder og leverandører 2025 | Rapport om Samarbeidsklimaet i Dagligvarebransjen 2023 |

Noen feiltreff stammer fra tilleggskilder, ikke nødvendigvis fra en kanonisk binding. De riktige originalene for campusmatsvinn, pandemireview, Uppsala og Dagligvaretilsynets 2021-rapport ble funnet lokalt. En CV erstatter ikke en forskningsrapport; en Nature Food-artikkel erstatter ikke Konkurransetilsynets src-73. Rapportene fra den finske matmarkedsombudsmannen og Dagligvaretilsynets samarbeidsundersøkelse har andre årganger enn registrert og holdes separat.

Øvrige presiseringer ligger ved hver kandidat: rapportår kan avvike fra filnavn, halvårsregnskap er en egen periode, språkversjoner og sammendrag er ikke uavhengige studier. Ulsaker-filen starter med en takkeside; tittelidentiteten er derfor fortsatt uavklart. Fire interne dokumenter/e-postutskrifter er holdt som intern kontekst. Ingen mandat-, finansierings- eller delingsgodkjenning er utledet fra dem.

## Leveranser

- [Dokumentkandidater](document-candidates.json): 140 identitetsobservasjoner med fil-, tekst-, bilde-, observasjons-, policy- og målprofilhash.
- [Gjeldende arbeidskø](queue.json): alle 392 ID-er med kildetilgang, kandidater og neste handling.
- [Fysisk sideindeks](page-index.json): sidehash og ordmengde; ingen fulltekst kopiert til Git.
- [Nettobservasjoner](cover-observations.tsv), [lokale observasjoner](local-cover-observations.tsv) og [dekodede årsrapporter](decoded-cover-observations.tsv).
- [Verifikasjon](verification.json): fem navngitte kontroller og 140 kandidat-/myndighetskontroller.
- [Rettede metadatakoblinger](excluded-metadata-links.json) og [maskinlesbar status](status.json).

## Backup

Ny Estate-kvittering binder den krypterte filen fra 9. september kl. 01.30 UTC. Manifestet registrerer restore 01.30.24 UTC og backup/offsite 01.30.28 UTC. Lokale krypterte bytes er SHA-kontrollert, og prosjektets 36-timerskontroll består. Dette er bevis fra Estate-jobben, ikke en ny restore kjørt her eller en ny nettverkskontroll av offsitekopiene. [Eksakt bevis](estate-evidence.json).

## Faktiske restanser

1. Full faglig lesing og presise påstand-/kildebindinger; de 140 førstesidene og sidehashene er ikke en full analyse.
2. Manglende originaler, HTML-identiteter, feil årganger og én uavklart PDF-tittel må følges etter køens konkrete handling.
3. De tidligere 11 dataeierpakkene og fire kildepakkene venter fortsatt på spesifisert nytt materiale. Se [inntaksbehov](../KILDE-OG-DATAEIERBEHOV.md). Ingen henvendelser er sendt.
4. Menneskelig review, mandat, kapasitet/finansiering, pilot, delingsnivå og driftsansvar/RPO/RTO gjenstår hos riktig eier. Se [beslutningsbehov](../BESLUTNINGER.md).

Ingen empiriske C1–C5-gap eller modellattestasjonsporter er lukket. Ingen databaseimport, migrasjon, deploy, publisering eller ny innlogget UI-kontroll er utført.

## Reproduksjon

Kjør `build-results.py` for hash- og regenereringskontroll; `--write` regenererer snapshottene. Private kildearkiver og de opprinnelige lokale filene må være tilgjengelige. `inspect-local.py` lager den formatkorrekte private uttrekksoverlegningen. `refresh-estate.py` kontrollerer den eksakte backupkilden. Den frosne innhentingsloggen kan ikke overskrives av `acquire-library.py`.
