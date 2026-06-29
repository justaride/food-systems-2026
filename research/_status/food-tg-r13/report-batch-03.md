---
tittel: Food TG R13 — Batchrapport 03
dato: 2026-06-27
goal: Food TG Research OS Runde 13 (autonom)
batch: 03
prompter: R13-WASTE-003, R13-WASTE-004, R13-WASTE-005, R13-WASTE-007
regel: Ingen DB-skriving, ingen claims, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme
status: Intern mottaksrapport — ikke faktastemme
---

# Batchrapport 03 — Food TG R13

## Oppsummering

| Beslutning | Antall | IDer |
|---|---:|---|
| enrich | 4 | R13-WASTE-003, R13-WASTE-004, R13-WASTE-005, R13-WASTE-007 |
| park | 0 | — |
| actor-gate | 0 | — |

## Mottaksrad-tabell (8 kolonner)

| ID | Tittel | Beslutning | Gate | Kildeklasse | Sterkeste kilde | Svakeste punkt | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-WASTE-003 | Matsvinn-redistribusjon | enrich | source-shortlist | B with C gaps | Matsentralen Norge Årsrapport 2024 (PDF, primær/aktørrapport) | TGTG norsk 2024-statistikk ikke offentliggjort; ingen nasjonal redistributionstotal | vent |
| R13-WASTE-004 | Husholdnings- og detaljmatsvinn | enrich | PCQ | A with C gaps | NORSUS/Matvett OR.16.24 + OR.28.25, åpne PDF med full metodedokumentasjon | Husholdning sist målt 2023 (42 % befolkningsdekning); matindustri nasjonalt kun t.o.m. 2022 | importer |
| R13-WASTE-005 | Digestat NPK-retur | enrich | PCQ | A with C gaps | Avfall Sverige Årsrapport SPCR 120 2023 | Norge: ingen nasjonal aggregert NPK-statistikk; alle NO-tall er substratspesifikke FoU-analyser | aktørspørsmål |
| R13-WASTE-007 | Industrielle næringssidestrømmer | enrich | source-shortlist | B with C gaps | Nofima-rapport 67/2016, Lindberg m.fl. | Per-fraksjon volum for slakteri/meieri — ingen oppdatert offentlig primærkilde | vent |

## Per-target outcome

### R13-WASTE-003 — Matsvinn-redistribusjon

**Beslutning:** enrich → source-shortlist (vent)

**Kilder verifisert:**
- Matsentralen Norge Årsrapport 2024 (primær, åpen PDF): 5 735 tonn omfordelt, 8 sentre, 354 leverandører, 544 mottakerorganisasjoner. Nedgang fra 6 090 tonn i 2023.
- Matvett faktaark 2024 alle sektorer (primær): redistribusjon ikke kvantifisert separat fra svinnreduksjon; dagligvare narrativt nevnt.
- Too Good To Go norsk pressemelding 2023 (sekundær): ~3,3 mill. poser / >3 000 tonn i 2023. Norsk 2024-tall ikke funnet (C).

**Utfall:** Matsentralen er eneste aktør med primærdokumentert norsk redistribusjonsvolum (2024). TGTG norsk 2024 er Type C. Nasjonal total ikke mulig uten metodebro mellom aktørene. Gate: source-shortlist; hold til TGTG og Matvett publiserer oppdaterte norske tall per kanal.

**Ikke si:** nasjonal redistribusjonstotal, TGTG 3 000 tonn i 2024, Matsentralen 6 000 tonn i 2024, «10,2 millioner måltider» som primærverifisert volum.

---

### R13-WASTE-004 — Husholdnings- og detaljmatsvinn

**Beslutning:** enrich → PCQ (importer)

**Kilder verifisert:**
- NORSUS/Matvett OR.16.24 (Stensgård 2024): husholdning 2023 = 193 200 tonn / 35,0 kg/innb. (–18 % fra 2016-baseline 222 300 tonn). Plukkanalyse, 42 % befolkningsdekning.
- NORSUS/Matvett OR.27.25 + OR.28.25 (Plataniti & Van de Glind 2025): totalt kartlagt 2024 ≈ 407 100 tonn / 73,4 kg/innb.; dagligvare 43 600 tonn (–47 % fra 2015-baseline 77 200 tonn).
- Bransjeavtale om matsvinn (Regjeringen.no, 2017/2025): frivillig, mål –50 % innen 2030; status 2024 = –24 % (eks. jordbruk).
- Matsvinnloven (Lovdata, vedtatt 2025-06-20): rapporteringsplikt; avventer forskrift — ikke i kraft ennå.

**Utfall:** Sterkeste kildegrunnlag i batch 03. Husholdning 2024 mangler (under bearbeiding); matindustri nasjonalt kun t.o.m. 2022. Metode- og basisårgap gjør kryssledd-sammenligning problematisk. Gate: PCQ — importer med synlige metodecaveater og tomme 2024-celler for husholdning.

**Ikke si:** husholdning kaster X tonn i 2024, at tallene kan summeres på tvers, at bransjeavtalen er juridisk bindende, at matsvinnloven er i kraft.

---

### R13-WASTE-005 — Digestat NPK-retur

**Beslutning:** enrich → PCQ (aktørspørsmål)

**Kilder verifisert:**
- Avfall Sverige Årsrapport SPCR 120 2023 (Hushållningssällskapet Östergötland): 12 samrötningsanläggningar, primærmålte verdier — Tot-N ~5,1 kg/tonn, Tot-P ~0,60 kg/tonn, Tot-K ~2,1 kg/tonn, NH4-N ~3,3 kg/tonn. Kildeklasse A.
- Norsk gjødselvareforskrift (Lovdata, ikrafttredelse 2025-01-29): innfører registrerings-/sporingskrav for biorest; genererer ikke aggregert tredjeparts NPK-statistikk per i dag.
- NIBIO/NORSUS FoU (sekundær): norske anleggsspesifikke tall — eks. Mjøsanlegget 2021: N 3,9 / P 0,27 / K 1,2 kg/tonn. Ingen nasjonal aggregering.

**Utfall:** Sverige = A; Norge = B/C. Det epistemiske hullet for Norge er strukturelt — manglende sertifiseringssystem. Ny gjødselvareforskrift (2025) endrer ikke dette på kort sikt. Krever aktørkontakt mot Biogass Norge / NIBIO for å avklare om aggregerte data vil komme. K-data særlig svak på systemnivå for begge land.

**Ikke si:** Norge har målt NPK-retur på nasjonalt nivå, norsk biorest har X kg/tonn som nasjonalt snitt, NPK-ratio 14-1-5 er primærmålt NO-data.

---

### R13-WASTE-007 — Industrielle næringssidestrømmer

**Beslutning:** enrich → source-shortlist (vent)

**Kilder verifisert:**
- Nofima-rapport 67/2016 (Lindberg m.fl.): samlede restråstoff-estimater for bryggeri (~17 000 tonn mask), meieri og slakteri (~264 000 tonn totalt). Kildeklasse B; utdatert (~10 år).
- Animalia Husdyrstatistikk 2025 (primær): ull 2 898 tonn (A); per-fraksjon slakteridata ikke disaggregert offentlig.
- FHF/HI nyhet 2025: MaskLaks-prosjekt (bryggeri-mask → laksefôr R5-potensial). FoU-fase, ikke realisert volum.
- TINE (aktørformidlet): ~450 000–640 mill. liter råmyse; 3 000 tonn WPC80 og 21 000 tonn laktosepulver er 2012-planer, ikke verifisert realisert produksjon.

**Utfall:** Side-stream ledger med 14 fraksjonerte rader skrevet. Bryggeri- og meierital er enten utdaterte (2016) eller aktørformidlede (TINE); slakteri per-fraksjon-data (blod, bein, huder) finnes ikke offentlig. Gate: source-shortlist — hent Nofima 67/2016 full PDF, TINE-årsrapport 2022–2024, og SSB industriavfallsundersøkelse 2022 (tabell 14458) for triangulering.

**Ikke si:** mask ~17 000 tonn er nåtidstall, TINE produserer 640 mill. liter myse i dag, meierislam er etablert biogasskilde.

---

## Oppfølgingspunkter

- **WASTE-003**: hold til TGTG publiserer norsk 2024-rapport; NORSUS/Matvett bør kontaktes for metodenøkkel redistribusjon vs. svinnreduksjon.
- **WASTE-004**: klar for PCQ-import med eksplisitte caveater. Husholdning 2024 og matindustri 2023 er neste målepunkter å overvåke.
- **WASTE-005**: aktørspørsmål til Biogass Norge / NIBIO v/ Eva Brod om aggregerte biorestdata under ny gjødselvareforskrift.
- **WASTE-007**: prioriter innhenting av Nofima 67/2016 fulltekst + TINE-årsrapport. SSB 14458 for triangulering av industritall.
- Ingen av batch-03-outputene åpner ekstern claim, visualisering eller whitepaper-stemme.
