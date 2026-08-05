# Rapport AP-8: Kildelesing og klassifisering — skive 19

**Status:** FULLFØRT  
**Agent:** Codex GPT-5  
**Tidsrom:** 2026-08-04 — avsluttet etter siste validering  
**Skive:** 19 av 20  
**Lesekatalog:** kanonisk arbeidskopi på grenen `codex/nordic-knowledge-canonical-v1` (kun lesing)  
**Kildeintegritet:** Alle 27 manifestenheter fantes ved kontroll, og manifestets størrelser samsvarte med de lokale kildene.
**Commits laget:** ingen

## 1. Hva som ble gjort

Jeg leste briefen, AP-8-instruksen, manifestet for `slice == 19` og hver av de 27 manifestkildene faktisk. For hver enhet skrev jeg én provisorisk triage-post i JSONL-filen for skive 19. Fem enheter var bare delvis lesbare som innholdskilder fordi de var metadata-/locatorfiler eller manglet full underliggende rapport; alle fem har `readState: "read_partially"`. Ingen enhet ble hoppet over, og ingen identitet ble flettet.

Arbeidet var avgrenset til triageutdataene. Det ble ikke skrevet til korpus, register, køer eller evidence-pack, og ingen database eller hemmelighetskilde ble brukt.

## 2. Kommandoer og kontrollpunkter

- Leste briefen og AP-8-instruksen i sin helhet, inkludert stoppregler, §5 og Vedlegg A.
- Filtrerte manifestet på `slice == 19` og kontrollerte at skiven hadde 27 enheter.
- Kontrollerte at alle manifestkilder fantes og at manifestert størrelse ikke hadde endret seg.
- Leste markdown-, PDF- og locator-kildene i lesekatalogen. PDF-er ble kontrollert med tekstuttrekk og sideinformasjon.
- Validerte triagefilen som 27 JSON-objekter, én per linje, mot AP-8-feltene og Vedlegg A-slugene.

## 3. Resultat og tellinger

| Kontroll | Resultat |
|---|---:|
| Enheter i skiven | 27 |
| Poster skrevet | 27 |
| Gyldige JSON-linjer | 27 |
| Unike identiteter | 27 |
| Manglende poster | 0 |
| `provisional: true` | 27 |
| Riktig `producedBy` | 27 |
| Manifestkilder mangler/endret størrelse | 0 / 0 |

### `readState`

| Verdi | Antall |
|---|---:|
| `read_fully` | 22 |
| `read_partially` | 5 |
| `unreadable` | 0 |

De fem delvis leste enhetene er Motiva-guidens metadatauttrekk, KRAVs metadatauttrekk og tre locator-/source-note-filer for PubMed/Segersven. Triagepostene beskriver derfor kun det som faktisk var tilgjengelig lokalt.

### `verdictForOwner`

| Verdi | Antall |
|---|---:|
| `prioriter` | 13 |
| `standard` | 8 |
| `lav` | 4 |
| `ut_av_omfang` | 2 |

`machineRoleWasCorrect: false` i 13 av 27 poster. Ti poster hadde også `titleMatchesQueue: false`; de tydeligste identitetsavvikene var en NHH-CV bak en forskningskøtittel og en generell Telemarksforsking-publikasjonsside bak en REKO-køtittel.

### Tre mest verdifulle funn

- `document:cmp8xyn9i00hbvvvmsbf56597` — Meile-oppgaven leser et norsk butikk-/prisdatasett fra 2013–2018 og gir et konkret empirisk anker for uniform prising, samtidig som den selv beskriver avgrensningene.
- `document:cmql058r500pp76vmrr0aorg6` — Det interne SSB-uttrekket dokumenterer en tidsserie for soya, soyamel og klippfisk mot Brasil/verden med HS-koder og tydelig skille mellom direkte tabelltall og åpne proxy-/dekningstak.
- `document:cmql0599j00r276vmejr960iv` — Struvittunderlaget skiller HIAS’ registrerte/igangsatte produkt fra upublisert realisert volum og fra eldre kapasitetsestimater, et viktig kontrollpunkt mot å gjøre kapasitet til faktisk produksjon.

### Duplikatmistanker

Det er én gjensidig duplikatmistanke, med to berørte poster:

- `document:cmqgiocx400m14nvm9njoncqt`
- `document:cmq8rsnhy000vekvmzikj43kz`

Begge lokale enheter peker på samme Nordic Council of Ministers-rapport, har samme URL, 115 sider og identisk normalisert rapporttekst. Dette er kun registrert i `duplicateSuspicion`; identitetene er ikke slått sammen.

## 4. Hva som gjenstår

1. Bekreft hvordan de to Nordic Council-identitetene skal håndteres; AP-8 har ikke flettet dem.
2. Send NHH-CV-/Telemarksforsking-avvikene til locator- og identitetsoppfølging.
3. Innhent og les full Motiva-guide, full KRAV-rapport og de tre locatoriserte akademiske kildene dersom de skal brukes videre.
4. Gjør eiergjennomgang av provisoriske roller, DATAGAP-relevans og prioriteringsverdict før eventuell videreføring til AP-9.

## 5. Beslutninger Gabriel må ta

1. **Duplikatparet:** Velg senere identitetsbehandling etter kontroll av provenance; anbefalingen er å beholde begge postene inntil eier har besluttet kanonisk representasjon.
2. **Locatoravvikene:** Velg om NHH-/Telemarksforsking-sporene skal sendes til AP-10; anbefalingen er ja, fordi triage viser at køtittel og faktisk fil ikke samsvarer.
3. **Delvise kilder:** Velg om fulltekst skal innhentes før AP-9; anbefalingen er ja for kilder som skal bære konkrete claims, ellers behold dem som eksplisitte partial/locator-funn.

Ingen post er promotert til register, kø eller kunnskapskorpus.

## 6. Risiko og forbehold

Alle kildebeskrivelser og claims i JSONL-en er refererende og provisoriske: de uttrykker hva dokumentene oppgir, ikke at opplysningene er bekreftet sanne. Interne synteser, aktørrapporter, sekundærkilder, scenariomodeller og locator-filer er merket gjennom rolle, kvalitetsdimensjoner, usikkerhet og `claimsWorthVerifying`.

De to `ut_av_omfang`-postene gjelder kilder som faktisk ikke matcher køens forventede dokumenttype/tittel. Dette er bevisste triagefunn, ikke identitetsreparasjoner. De fem delvise postene bør ikke brukes som om full kilde var lest. Eventuell videreføring må beholde skillet mellom kapasitet og realisert volum, modellert scenario og observert effekt, samt kildeutsagn og bekreftet kunnskap.
