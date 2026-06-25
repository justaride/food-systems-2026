---
id: R13-LAND-001
tittel: Makt og eierkonsentrasjon i norsk matsystem
dato: 2026-06-25
gate: PCQ
status: mottaksført
lagre_output: research/external/r13/R13-LAND-001-makt-eierkonsentrasjon.md
bruksregel: Strukturkart for kontrollkø. Ikke claim-lock, ikke intensjonsforklaring, ikke visualiser som kontrollpåstand.
---

# R13-LAND-001 - makt/eierkonsentrasjon

## Kort dom

Dette er brukbart som **strukturkart**, ikke som intensjonskart. Dagligvareleddet har sterke regulatorankre for konsentrasjon og paraplykjedestruktur. Oppstrømsleddene har gode rolle-, regulator- og samvirkekilder, men ikke én sammenlignbar åpen konsentrasjonsmetode på tvers av dagligvare, grossist, foredling og fôr.

## Mottakstabell

| Segment | Funn | Kilde | Klasse | Tom celle / caveat |
|---|---|---|---|---|
| Dagligvareomsetning | NorgesGruppen 43,5 %, Coop 29,2 %, Rema 1000 24,0 %, Bunnpris 3,4 % av nasjonal dagligvareomsetning i 2025. | Konkurransetilsynet, Dagligvarerapport 2025 | A | Avrundet. KT presiserer at tallene ikke nødvendigvis er en juridisk markedsavgrensning. |
| Butikkformat | Lavpris utgjør 70,3 % av omsetningen i 2025; bredsortiment 22,4 %, nærbutikk 7,3 %. | Konkurransetilsynet, Dagligvarerapport 2025 | A | Formatdefinisjoner må vises hvis tallene brukes. |
| Eierfotavtrykk | KT kartlegger 1 323 tilknyttede selskaper for NorgesGruppen, 595 for Coop, 517 for Reitan og 165 for Bunnpris. | Konkurransetilsynet, Dagligvarerapport 2025 | A | Selskapsantall er ikke verdi, kontrollgrad eller omsetning. |
| Grossist/distribusjon | ASKO leverer til NorgesGruppen-kjedene og Bunnpris; Coop Norge håndterer innkjøp, logistikk, kjededrift og markedsføring for Coop. | ASKO, Coop årsrapporter, KT | A/B | Struktur er dokumentert; sammenlignbare grossistandeler er ikke lukket. |
| Melk/meieri | Tine SA er markedsregulator for melk; Landbruksdirektoratet rapporterer 75,3 % av melk brukt i PU i 2025. | Landbruksdirektoratet Markedsrapport 2025 | A | PU-andel er ikke det samme som all meieriomsetning i retail. |
| Kjøtt/egg | Nortura SA er markedsregulator for kjøtt/egg og rapporterer slaktevolum/aktive eiere. | Nortura Annual Report 2025; Landbruksdirektoratet | A/B | Total markedsandel per kategori er ikke lukket i denne runden. |
| Korn/fôr | Felleskjøpet Agri er markedsregulator for korn; Landbruksdirektoratet oppgir 2,03 mill. tonn solgt kraftfôr totalt og 61 % norske råvarer i 2025. | FKA årsrapport; Landbruksdirektoratet | A/B | Totalmarkedet er sterkt, produsentsplitt er ikke lukket. |
| Fôrstruktur | FKA, FKRA, Fiskå Mølle og Norgesfôr beskrives som fire dominerende aktører i korn-/kraftfôrmarkedet. | Landbruksdirektoratet frakt/korn-kraftfôr-rapport 2022 | A | Eldre strukturkilde; mangler oppdatert andelstabell. |

## Sterkeste kilde

Konkurransetilsynets Dagligvarerapport 2025 er sterkest for dagligvarekonsentrasjon, eierkart og formatandel fordi den er regulatorprodusert, fersk og tydelig på metode/caveats.

## Svakeste punkt

Det svakeste punktet er sammenlignbare konsentrasjonsmål for grossist/distribusjon og fôrprodusentandeler. Åpne kilder viser struktur og roller, men ikke en ren, nåværende HHI-/andelsserie på tvers av aktører.

## Kildeklasse og hull

| Felt | Klasse | Hulltype |
|---|---|---|
| Dagligvareandeler, formatandeler, KT eierkart | A | Type A: kan PCQ-es mot KT-tabeller. |
| Markedsregulatorroller og årsrapportstruktur | A/B | Type A for roller; Type B for aktørrapporterte detaljer og manglende ekstern share-tabell. |
| Grossistandeler, kontrakter, leverandørmakt | B/C | Type B actor-gate for private avtaler; Type C for samlet systemmetrikk uten åpen kilde. |

## Tomme celler

- Grossistmarkedsandeler for ASKO, Coop, Rema Distribusjon og andre.
- Nåværende fôrprodusentandeler.
- Sammenlignbare foredlingsandeler for kjøtt, egg, meieri, bakervarer, sjømat og merkevaremat under samme nevner.
- Beneficial ownership utover KT sin publiserte aggregering.
- Tverrsegment HHI eller annen felles maktkonsentrasjonsmetode.

## Ikke si

- Ikke si at konsentrasjon beviser intensjon.
- Ikke si at matsystemet kontrolleres av én aktør.
- Ikke utled grossistandeler direkte fra retailandeler.
- Ikke behandle markedsregulatorstatus som markedsandel.
- Ikke bruk aktørrapporter som nøytral andelskilde uten B-merking.
- Ikke gjør samvirkeeierskap til privat eierintensjon.

## Anbefalt gate

`PCQ`, med splitthåndtering. KT-radene og Tine/Landbruksdirektoratet-raden kan løftes til kontrollkø. Nortura/FKA-strukturrader trenger synlig caveat. Grossistandeler og fôrprodusentandeler må bli actor-gate eller intern datagap til sammenlignbare tall finnes.

## Primærkilder

| Kilde | URL | accessedAt | Klasse |
|---|---|---|---|
| Konkurransetilsynet, Dagligvarerapport 2025 | https://konkurransetilsynet.no/wp-content/uploads/2026/04/Dagligvarerapport-2025.pdf | 2026-06-25 | A |
| ASKO | https://asko.no/ | 2026-06-25 | A/B |
| Coop årsrapporter | https://www.coop.no/om-coop/aarsrapporter | 2026-06-25 | B |
| Landbruksdirektoratet, Markedsrapport 2025 | https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Markedsrapport%202025%20Rapport%202026%202%2003.03.26.pdf | 2026-06-25 | A |
| Nortura Annual Report 2025 | https://www.nortura.no/attachments/Annual-report/Nortura_annual_report_2025.pdf | 2026-06-25 | B |
| Landbruksdirektoratet, markedsregulatorer | https://www.landbruksdirektoratet.no/nb/jordbruk/regulering-og-kvoter/markedsregulering-i-jordbruket/markedsregulatorer | 2026-06-25 | A |
| Felleskjøpet Agri årsrapport 2025 | https://fka.felleskjopet.no/globalassets/medlem/arsrapporter/aarsrapport_felleskjoepet_2025-2.pdf | 2026-06-25 | B |
| Landbruksdirektoratet, frakt korn/kraftfôr 2022 | https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Gjennomgang%20av%20tilskudd%20til%20frakt%20av%20korn%20og%20kraftf%C3%B4r%20Rapport%202022%2020.pdf | 2026-06-25 | A |
| Brreg Enhetsregisteret API | https://data.brreg.no/enhetsregisteret/api/enheter | 2026-06-25 | A |
