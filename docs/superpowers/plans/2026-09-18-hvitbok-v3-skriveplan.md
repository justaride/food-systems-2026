---
tittel: Skriveplan — hvitbok v3 og tre artikkelpiloter
dato: 2026-09-18
status: Klar til kjøring
vedtak: docs/superpowers/specs/2026-09-18-hvitbok-ferdigstilling-design.md
---

# Skriveplan: hvitbok v3 og tre artikkelpiloter

Denne planen er arbeidsordren for skriveøkten 18. september 2026. Målet er et så ferdig utkast som mulig i dag. Les vedtaksnotatet først. Del 2 og 3 der (vedtakene og hva presentasjonsklar betyr) styrer alt under.

Planen har to oppdrag som kan kjøres parallelt:

- **Oppdrag A:** hvitbok v3, påstandsregister og skrivelogg
- **Oppdrag B:** tre artikkelpiloter (V9, V6, V10)

## 1. Rammer for begge oppdrag

**Skriv bare nye filer** i `research/whitepaper/v3/`. Ikke endre eksisterende filer. Mange av dem er hashlåst i korpusregisteret, og `/hvitbok` genereres fra v2. Ikke commit og ikke push. Det gjør økten som startet deg.

**Språk:** Norsk bokmål i klarspråk. Skriv korte setninger i aktiv form, og forklar fagord første gang de brukes (for eksempel HHI og CR3). Tonen er saklig og analytisk, uten salgsspråk og uten aktivisme. Formålet er analytisk troverdighet.

**Leser:** NCH-medlemmer, partnere, forskningspartnere, forvaltning og beslutningstakere. Leseren er klok, men ikke fagspesialist på alle ledd.

**Faktaregler.** Innsiktskatalogen (`docs/project/analysis/food-tg-innsiktskatalog-2026-09-15.md`) er registeret over funn og status. Regelen følger statusen:

| Status i katalogen (eller i v2) | Slik brukes funnet |
|---|---|
| Siterbar, Siterbar med forbehold, [K], [F] | Som fakta. Forbeholdet fra «Merk»-kolonnen skal stå i teksten. |
| Kontrollert internt | Som fakta, med forbehold. Registeret merker raden «stikkprøve før presentasjon». |
| Intern syntese, Uklar, [I] | Bare som hypotese, spørsmål eller kunnskapshull, og uten tall. Skriv for eksempel «En arbeidshypotese er …» eller «Vi vet ennå ikke …». |
| Blokkert, [H] | Bare som datagap eller beslutning som mangler, under «neste steg». |
| Strøket (katalogen del 4) og forbudt språk (v2 §13.2) | Aldri. |

**Tilleggsregler:**

- **Personer:** Ingen personnavn fra maktkartet (styremedlemmer, eiere eller ledere). Selskaper, konsern og myndigheter kan nevnes når funnet tillater det.
- **Nye fakta:** Hent dem bare fra kontrollfilene som er listet i del 2, med sti og lokator. Før dem i registeret med katalog-ID «NY» og status slik kildefilen oppgir den. Ikke gjør nytt nettsøk etter tall. Mangler du et tall som trengs, noterer du det i skriveloggen.
- **Tidskritiske fakta** (EUDR, gebyrsaken mot kjedene, Dagligvaretilsynet, kornlager og nordisk erklæring) får merknaden «per 15.09.2026, fersksjekkes før bruk» i registeret.
- **Tall:** Oppgi år, enhet og nevner. Butikkandel er ikke omsetningsandel, og kapasitet er ikke realisert produksjon. Utnyttet restråstoff er heller ikke høyverdiutnyttet.
- **Markører:** Hver faktasetning får en markør som `[P-012]` bak seg. Markøren peker til påstandsregisteret. Én markør kan dekke flere setninger i samme avsnitt om samme funn.

## 2. Lesing (i denne rekkefølgen)

**Styrende:**

1. `docs/superpowers/specs/2026-09-18-hvitbok-ferdigstilling-design.md`
2. `docs/project/analysis/food-tg-innsiktskatalog-2026-09-15.md`, hele. Del 3 er funnene, del 4 det som ikke skal brukes og del 6 rapportvinklene.
3. `docs/meetings/GABRIEL-CLAUDE - Arbeidsavklaring 15-09-26.md`
4. `docs/meetings/FOOD TRANSITION - Møte 19-06-26.md`, særlig §2.4 om hvitboklogikken
5. `docs/project/analysis/food-tg-objektivfunksjon-VEDTAK-2026-06-18.md`

**Innhold (hovedgrunnlaget):**

6. `research/whitepaper/food-systems-2026-synthesis-v2.md`, hele, med statuskodene [K], [F], [I] og [H]
7. `docs/project/analysis/source-review-beredskap-2026-09-09/round-002/WHITEPAPER-REVISJON.md` og `round-002/README.md`
8. `docs/project/analysis/source-review-beredskap-2026-09-09/WHITEPAPER-BEREDSKAP-ARBEIDSUTKAST.md` (fem kandidatkort)
9. `docs/project/analysis/source-review-beredskap-2026-09-09/round-003/`, `round-004/` og `round-005/WHITEPAPER-TILLEGG.md`
10. `research/beredskap-kompetanse-sammenstilling/KUNNSKAPSGRUNNLAG-SAMLET.md` (R9)
11. `docs/project/analysis/food-tg-maktkart-whitepaper-kapittel-2026-06-15.md`
12. `docs/project/analysis/food-tg-systemmodell-integrert-2026-06-18.md` (låsesløyfer, hypoteser)
13. `research/sirkulaere-konkurser/hva-feilet-syntese-2026-09-15.md`
14. `docs/project/analysis/case-avsjekk/mottak-eudr-v6-kontroll-2026-09-15.md`
15. `research/external/r6/DRO-R6-INDEX-2026-06-18.md` og `research/external/r6/deep-research-r6-n11-bondemargin-2026-06-18.md`
16. `DATAGAP-ANALYSE-2026-07-06.md` (det Norge ikke måler)
17. `docs/project/mandates/roadmap-food-tg-2026-2029-v0.2-draft.md` (veien videre, porter)
18. `research/CITABLE-ACCEPTANCE-TESTS.md` (CA-001 til CA-016: hva som kan siteres og hvordan)

Følg lenker fra disse filene bare når du trenger kilden bak et bestemt funn.

## 3. Oppdrag A: hvitbok v3

### Filer

| Fil | Innhold |
|---|---|
| `research/whitepaper/v3/hvitbok-v3-utkast.md` | Selve hvitboka |
| `research/whitepaper/v3/pastandsregister.md` | Én rad per påstand, se format under |
| `research/whitepaper/v3/SKRIVELOGG.md` | Hva som er brukt, utelatt og hvorfor. I tillegg åpne spørsmål til Gabriel og Jan Thomas, tidskritiske fakta og tall som mangler. |

Hvitboka starter med frontmatter:

```yaml
---
tittel: "<velg, se forslag>"
status: utkast-v3 — ikke presentasjonsklar før fase 2–5 i vedtaksnotatet
dato: 2026-09-18
ekstern_sitering: false
grunnlag: research/whitepaper/v3/pastandsregister.md
---
```

**Tittelforslag** (velg ett eller lag et bedre): «Et robust og sirkulært matsystem – hva vi vet, hva vi ikke vet, og hvor vi bør begynne», eller «Fra kartlagt struktur til robust matforsyning».

**Lengde:** 9 000–12 000 ord hovedtekst. Sammendraget er på høyst 700 ord.

### Disposisjon

Katalog-IDene i parentes viser hvilke funn hvert kapittel bygger på. Følg faktareglene for hver ID.

0. **Sammendrag.** 5–7 hovedbudskap og de foreslåtte satsingsområdene. Skriv det til slutt.
1. **Hvorfor dette notatet.** Formål og avsender (Food Transition Group, Natural State og NCH), objektivfunksjonen (BE-17) og systemgrensen (v2 §2). Forklar kort hvordan kildestatus er håndtert, og at dette er en analyse, ikke et politisk program.
2. **Røntgenbildet: matsystemet ledd for ledd.** Hvert ledd får fire korte deler: hva vi vet, styrke, svakhet eller sårbarhet, og hva vi ikke vet.
   - 2.1 Innsatsvarer, fôr og protein (BE-04, BE-06, SI-04, SI-05; selvforsyningsmetode fra v2 S05)
   - 2.2 Primærproduksjon og bondeøkonomi (BE-18, BE-19, MA-10)
   - 2.3 Foredling (MA-04, MA-07)
   - 2.4 Grossist og logistikk (MA-05, KO-14; SI-18 bare som hypotese)
   - 2.5 Dagligvare (MA-01, MA-02 med nevnerforbehold, MA-13, SI-11)
   - 2.6 Offentlige kjøkken og husholdninger (HV-05, KO-12, KO-13; BE-20 bare som spørsmål)
   - 2.7 Sjømat og marint restråstoff (MA-11, SI-01)
   - 2.8 Strømmene tilbake: matsvinn og næringsstoffer (v2 §8.3–8.5, HV-07)
3. **Makt og konsentrasjon på tvers av ledd.** Bygger på MA-01, MA-03, MA-04, MA-05, MA-07, MA-09, MA-10, MA-13 og SI-11, og på maktkartkapittelet. Struktur er ikke atferd. Ingen personnavn, og MA-08 er blokkert.
4. **Beredskap: fra lager til leverbar mat.** Bygger på septemberrevisjonen og R9.
   - 4.1 Hva beredskap betyr her: en matfunksjon for en mottaker over tid
   - 4.2 Korn: reserve er ikke mat (BE-03, BE-05, BE-13; Furuset-caset BE-11 som metode, ikke resultat)
   - 4.3 Mennesker og kompetanse (KO-01 til KO-08, KO-11, KO-14)
   - 4.4 Nordisk samarbeid: en ramme, ikke en leveranse (BE-10, KO-07)
5. **Sirkularitet: når den styrker beredskapen, og når den ikke gjør det.**
   - 5.1 Kaskaden og mattrygghet som port (v2 §8.1–8.2)
   - 5.2 Utnyttelse er ikke verdi (SI-01, SI-02; SI-03 bare som hypotese)
   - 5.3 Styring slår teknologi (SI-04, KO-06)
   - 5.4 Koblingen som mangler (SI-12 til SI-14 som hypotese og eksempler; SI-14 er blokkert)
   - 5.5 Hva som feilet: sirkulære konkurser (SI-16, SI-17; HV-06 bare som hypotese)
6. **Norden: hva vi kan lære og løse sammen.** Bygger på MA-03 (Finland § 4a), MA-15 (ingen rangering), HV-05 med København (v2 S19), EUDR (SI-06 til SI-09), BE-05 og KO-07.
7. **Det ingen teller.** Kunnskapshull som styringsfunn, bygget på v2 §11, KO-02, KO-03, HV-07, HV-08, BE-02, BE-14 og DATAGAP-ANALYSE.
8. **Satsingsområder.** Slå sammen de fem overgangsleverne i v2 §10 og de fem kandidatkortene fra september til **3–5 foreslåtte satsingsområder**. Hvert område beskrives med:
   - hvilken sårbarhet det adresserer, og den sirkulære eller strukturelle mekanismen
   - hva Norden tilfører
   - et målbart utfall og hva som kan avkrefte ideen
   - første steg og hvem som må være med
   - om området passer i NordForsk-uttrekket

   Mulige kandidater: korn og logistikk fra reserve til mottaker (med hub-bortfall på 24 timer, 72 timer og 2 uker), sidestrømmer og næringsstoffer som innsatsberedskap, institusjonskjøkken som bro, markedsadgang og konkurranse som robusthet, og et nordisk måleprogram for det ingen teller. Merk tydelig at valget er et forslag som Gabriel og Jan Thomas bestemmer.
9. **Veien videre.** Observatoriet og roadmapen, NordForsk (temaet er åpent), artikkelsporet og hva som kreves før offentlig publisering (v2 §15, H-01 til H-06).

**Vedlegg A: Metode og kildestatus.** Kort versjon av v2 §3 og §13: fail-closed, KI-analyse med menneskelig kontroll og de fire statusene.

**Figurforslag.** Lag 5–8 bokser av typen «Figurforslag: hva figuren viser, datakilde (sti), status». Ikke lag bilder.

### Påstandsregister (format)

```markdown
| P-ID | Påstand (kort) | Katalog-ID | Status | Kilde (sti + lokator) | Forbehold som skal følge | Fersksjekk | Brukt i |
|---|---|---|---|---|---|---|---|
| P-001 | Omsetnings-HHI i norsk dagligvare 3 327, CR3 96,6 % (2024) | MA-01 | Siterbar med forbehold (CA-004) | analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md §11 | HHI er indeks, CR3 andel | – | kap. 2.5, 3 |
```

Én rad per påstand. Hypoteser får egne rader med status «Intern syntese – brukt som hypotese». Registeret slutter med en opptelling per status.

## 4. Oppdrag B: tre artikkelpiloter

### Filer

- `research/whitepaper/v3/artikler/V9-hvor-sjokket-lander.md`
- `research/whitepaper/v3/artikler/V6-eudr-treffkartet.md`
- `research/whitepaper/v3/artikler/V10-hva-som-feilet.md`

### Format per artikkel

1. Tittel og ingress (2–3 setninger)
2. Brødtekst på 700–1 000 ord med 3–5 mellomtitler, inkludert «Hva betyr dette?» og «Hva vi ikke vet ennå»
3. Forslag til faktaboks eller figur
4. Kildeliste med offentlige primærkilder (URL fra kildefilene), ikke interne filer
5. LinkedIn-versjon på høyst 1 300 tegn
6. **Intern kontrollboks** (fjernes før publisering): katalog-IDer, status, forbehold og fersksjekkpunkter

**Avsender:** «Natural State / Nordic Circular Hotspot – Food Transition Group». Stemmen er kunnskapsformidling, ikke kampanje. Faktareglene i del 1 gjelder fullt ut.

### Vinkler

- **V9 Hvor sjokket lander (BE-18, BE-19; kilde R6):** kostnads- og prisskvisen i bondeøkonomien og gjødselsjokket. Normalisert kalkyle er ikke driftsregnskap, og inntektsmålene må ikke blandes. BFJ har justert 2023-tallet senere, så bruk tallene slik R6-filene og merknaden 15.09 oppgir dem. Per-kilo-margin er ukjent og krever aktørdata.
- **V6 EUDR-treffkartet (SI-06 til SI-09; kilde mottaksnotatet 15.09):** Hvor avskogingsregelverket treffer nordiske verdikjeder, og hvor det ikke gjør det. 30.12.2026 er EU-datoen, ikke en norsk dato. EUDR er ikke innlemmet i EØS eller norsk rett. Brasil er «standard risk», aldri «lavrisiko». Eksponeringen for kakao ligger i EU-leddet. Skriv «per 15.09.2026» ved regulatorisk status.
- **V10 Hva som feilet (SI-16, SI-17, HV-06; kilde konkurssyntesen):** Hva nordiske konkurser i sirkulær mat og alternativt protein lærer oss. Konkurs betyr ikke at teknologien feilet. Årsakene bygger på selskapenes egne forklaringer og presse, og det skal stå. Bruk bare registerkontrollerte datoer. Selskapsnavn er tillatt, personnavn ikke.

## 5. Egenkontroll før du leverer

- [ ] Alle `[P-nnn]` i teksten finnes i registeret, og alle rader i registeret er brukt.
- [ ] Ingen rad med status Intern syntese, Uklar eller Blokkert bærer et tall eller en faktasetning.
- [ ] Søk i egne filer etter strøkne formuleringer: `3 445`, `t = 14`, `70 % av fôret`, `39 %`, `lavrisiko`, `7 %` (restråstoff), `36 %`, `høyverdiutnyttet`, `halvering`, «kaffe er innlemmet» og `10,94`. Ingen treff skal brukes som fakta.
- [ ] Ingen personnavn fra maktkartet.
- [ ] HHI står aldri med prosenttegn, og butikkandel kalles aldri omsetningsandel.
- [ ] Tidskritiske fakta er merket i registeret.
- [ ] Skriveloggen lister alt som er utelatt fra v2 og september-utkastet, med grunn.
- [ ] `git diff --check` er ren for de nye filene (ingen avsluttende mellomrom).

## 6. Levering

Svar med en kort rapport:

- filene som er skrevet, med antall ord
- antall påstander per status
- de tre viktigste redaksjonelle valgene
- satsingsområdene som er foreslått
- de største hullene og spørsmålene til Gabriel og Jan Thomas
