# Rapport R2 — Skive 5 av 8 (kjernelesning)

**Status:** provisorisk — internt analysemateriale, ikke publiserbart
**Ekstraktfil:** `INNSIKT-SPOR/ekstrakt/kjerne-skive-5.jsonl` (15 linjer, én per kilde)
**Lest:** 15 av 15 kilder. Fullt: 11. Delvis: 4. Ulest: 0.

## Sammendrag

Alle 15 tildelte kilder ble lest og ekstrahert. 65 findings totalt. Ingen kilde
var utilgjengelig. De fire store PDF-ene (ICA 191s, konkurrensverket-2024:4 111s,
NOU 138s, src-158 134s) ble lest delvis — sammendrag, metode og de seksjonene
som bærer tall — de øvrige elleve i sin helhet.

Skiven er tung på **makt/eierskap og konkurranse i nordisk dagligvare** (svensk og
norsk konkurransemyndighet, dagligvaretilsyn, Lidl-case, ICA), på **økologi/materialstrømmer**
(svensk + norsk økostatistikk, N2O-feltforsøk, dansk sirkulærøkonomi) og har enkeltkilder
på **alternativt protein** (Ÿnsect-konkursen).

## Lesetall per lesetilstand

| Lesetilstand | Antall | Kilder |
|---|---:|---|
| read_fully | 11 | ynsect, ekomatsligan, jordbruksverket-animalie, innkjopspriser, dagligvarerapport-2024, dagligvaretilsynet-2022, landbruksdirektoratet-øko, bojo-2023, hiis-eg-N2O, konkurrensverket-summary, selmani-forre (Lidl) |
| read_partially | 4 | src-158 (Danmark sirkulær), konkurrensverket-2024:4, nou-2013-6, ica-gruppen-2024 |
| ulest | 0 | — |

## Findings-dekning per DATAGAP-felt

Ett funn treffer ofte flere felt. Totalt 65 findings:

| Felt | Findings |
|---|---:|
| makt_eierskap | 32 |
| okologi_jordhelse | 23 |
| materialstrommer | 22 |
| aktordybde | 16 |
| nordisk_dybde | 15 |
| kausalitet | 14 |
| lokale_verdikjeder | 13 |
| kvalitativt_lag | 6 |
| alternativt_protein | 5 |
| offentlig_innkjop | 5 |
| beredskap_import | 4 |

## Grunnlag (basis) — det viktigste kravet

| basis | findings | merknad |
|---|---:|---|
| aktoropplysning | 33 | Årsrapporter (ICA), selskaps/bransjetall (DLF/Delfi, Livsmedelsföretagen), survey-selvrapportering, sekundærsitater i masteroppgaver |
| maalt | 25 | Offentlig statistikk (Jordbruksverket, Landbruksdirektoratet, SSB/SCB matinflasjon, N2O-feltforsøk, markedsandeler beregnet av Konkurransetilsynet) |
| modellert | 5 | src-158 (EMF 2035-scenario), N2O europeisk oppskalering 5-20 %, bojo diskursanalyse |
| ikke_oppgitt | 2 | Ÿnsect kostnadsforhold 2-10x og "far from circular"-påstander uten oppgitt metode |

Ingen `internal_synthesis`-kilde i skiven; alle 15 er eksterne primær- eller
sekundærkilder. Flagget eksplisitt der en akademisk kilde bare **siterer** et tall
(bojo, Lidl-case, NOU) framfor å måle det selv — disse er merket `aktoropplysning`
med sekundærsitatet oppgitt i `systemBoundary`/`locator`.

## Motsigelser (contradicts)

Én registrert: **landbruksdirektoratet-øko vs jordbruksverket-animalie** — begge viser
fallende/stagnerende økoandeler, men Sveriges økoandel av *produksjon* (melk ~11 %,
storfeslakt ~12 %) er høyere enn Norges ~2 % økoandel av *dagligvaresalg*. Ulike nevnere
(SE = andel av produksjon; NO = andel av detaljsalg) gjør tallene ikke direkte
sammenlignbare — notert som forbehold, ikke som ekte uenighet.

## Systemgrenser jeg var særlig nøye med

- **Anvendelsesgrad** (NO økostatistikk): "levert til meieri" vs "videresolgt som økologisk"
  er ikke det samme — 20 % av økomelka og 59 % av firbeint økokjøtt selges som konvensjonelt.
- **Slaktvekt** (SE): "levert til slakt fra omstilt produsent" ≠ "solgt som økologisk i butikk".
- **Markedsandel** (Konkurransetilsynet): fysisk butikksalg, ekskl. nett/bensin/servicehandel.
- **N2O-reduksjon 50-95 %** = feltmålt på gitte jordtyper; **5-20 %** = modellert europeisk oppskalering.
- **src-158**: alle sektorbeløp er 2020/2035-scenarioestimater, ikke realiserte strømmer.

## Kilder som ikke lot seg lese

Ingen. Alle 15 hadde tilgjengelig fulltekst (direkte .md/.txt eller pdftotext).
For fire md-filer som var "metadata-only snapshot" (bojo, src-158, landbruksdirektoratet)
lå den faktiske fullteksten enten i md-fila etter `--- URL text extraction ---` eller i
en sidestilt PDF; PDF-ene ble brukt der de fantes for reneste tekst.

## Merknad om «Det ingen måler» (notMeasured)

Fylt for alle 15 kilder. Sterkeste Type C-signaler i skiven:
- Konkurransetilsynet offentliggjør **ikke** størrelsen på innkjøpsprisforskjellene (forretningssensitivt).
- Konkurrensverket undersøkte **ikke** om de koordinerte lanseringsvinduene (ICA/Axfood/Coop) bryter konkurranseloven.
- Ingen kilde måler realiserte lokale materialstrømmer i volum; src-158 og hiis-eg er henholdsvis scenario og feltforsøk, ikke gjennomstrømning.
- Dagligvaretilsynets survey sier **hva** som er problematisk, ikke **hvorfor**.
