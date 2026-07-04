# Research Program Evidence

Export date: 2026-07-04
Packet type: evidence
Status label: program plan; not claim proof
Allowed use: Use only according to the status label. Keep caveats and missing cells visible.

## What This Source Is For

Curated evidence packet for research program evidence.

## Core Claims Or Working Propositions

- Use the included excerpts as source-grounded context, not as permission to upgrade claims.
- Preserve source labels, method distinctions and explicit gaps.
- If the source says wait, parked, actor-gated or do-not-visualize-yet, keep that boundary.

## Evidence Table

| Signal | Use | Boundary |
| --- | --- | --- |
| Included source excerpts | Give NotebookLM retrieval surface. | Excerpted for quality; source file remains canonical. |
| Status label | Controls allowed use. | Do not upgrade without separate verification. |
| Known gaps | Useful for decisions and actor questions. | Missing values must stay visible. |

## Known Caveats

- This packet may combine sources with different evidence levels.
- Do not create external deck claims without checking the strictest status among the supporting sources.

## Deck Angles

- Use as evidence spine for a slide or appendix section.
- Phrase as "what the evidence supports" plus "what remains blocked".

## Bad Generic Framing To Avoid

- Do not remove the source label.
- Do not turn a candidate or shortlist into a completed finding.

## Source Paths Included

- docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md
- research/_status/food-tg-r13/r13-intake-index-2026-06-25.md
- research/RESEARCH-MISSIONS.md

## Source Excerpts

### docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md

````markdown
# GOAL: Execute Food TG Research OS Runde 13 (autonom)

## Goal-setning

Kjør hele R13-backloggen (50 prompts) autonomt med R2-berikelsesdisiplin: for hver prompt, hent primærkilder, skriv et mottakbart research-artefakt, fatt en mottaksbeslutning, og rull funnene opp i en intake-indeks. Ingen output blir ekstern faktastemme. Goalet er ferdig når alle 50 prompts har output-fil, decision-rad og intake-rad, og kontrollene er grønne.

## Inndata (les disse først)

1. **Promptpack** — `docs/project/mandates/food-tg-research-runde13-promptpack-2026-06-25.md` (selve promptene + universal instruks).
2. **Backlog-CSV** — `research/_status/food-tg-research-backlog-2026-06-25.csv` (kanonisk ID/gate/next_artifact).
3. **Masterplan** — `docs/project/mandates/food-tg-research-runde13-masterplan-2026-06-25.md` (rekkefølge §8, stop-regler §9).
4. **Mottaksprotokoll** — `docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md` (A/B/C, hulltyper, gates).
5. **Intake-mal** — `research/_status/food-tg-r13/r13-intake-index-2026-06-25.md` (fylles per batch).

CSV-en er fasit for ID, rekkefølge, gate og `next_artifact`. Promptpacken er fasit for prompt-tekst og `Lagre output`-sti.

## Harde regler (gjelder hele kjøringen)

1. **Primærkilde først.** Sekundær-/speilkilde bare når primær mangler, og merk `B`.
2. **Ikke gjett.** Tomme celler og dokumentert fravær er gyldige funn.
3. **Skill kildeklasse `A`/`B`/`C` per funn**, ikke bare per dokument.
4. **Skill realisert volum, kapasitet, plan, potensial og hypotese.**
5. **Hver output ender i én gate:** source-shortlist, PCQ, claim-lock, actor-gate, forstaelse, internal eller parkert.
6. **Lag alltid en `Ikke si`-liste.** Mangler den, er importbeslutning `vent`.
7. **Ingen DB-skriving, ingen `safe_for_ai_context`, ingen claim-åpning, ingen whitepaper-/deck-tekst.**
8. **Følg stop-reglene i masterplan §9.** Parker heller enn å overclaime.
9. **Hold deg til scope per prompt.** Én prompt = ett smalt artefakt.

## Kjørerekkefølge og batcher

Kjør gap-closure først (masterplan §8), deretter food-waste, protein-alt, actor-map, innovation, ecology, landscape. 13 batcher à ~4 prompts:

| Batch | Prompt-IDer |
|---|---|
| 01 | R13-GAP-001, R13-GAP-005, R13-WASTE-001, R13-GAP-002 |
| 02 | R13-GAP-004, R13-GAP-006, R13-GAP-003, R13-WASTE-002 |
| 03 | R13-WASTE-003, R13-WASTE-004, R13-WASTE-005, R13-WASTE-007 |
| 04 | R13-WASTE-006, R13-WASTE-008, R13-PROT-006, R13-PROT-007 |
| 05 | R13-PROT-001, R13-PROT-002, R13-PROT-003, R13-PROT-004 |
| 06 | R13-PROT-005, R13-PROT-008, R13-AKTOR-001, R13-AKTOR-002 |
| 07 | R13-AKTOR-003, R13-AKTOR-004, R13-AKTOR-006, R13-AKTOR-005 |
| 08 | R13-AKTOR-007, R13-AKTOR-008, R13-INNO-001, R13-INNO-002 |
| 09 | R13-INNO-003, R13-INNO-004, R13-INNO-006, R13-INNO-005 |
| 10 | R13-INNO-007, R13-OKO-001, R13-OKO-002, R13-OKO-003 |
| 11 | R13-OKO-005, R13-OKO-007, R13-OKO-004, R13-OKO-006 |
| 12 | R13-LAND-001, R13-LAND-002, R13-LAND-005, R13-LAND-003 |
| 13 | R13-LAND-004, R13-LAND-006 |

Innenfor en batch: kjør P0/P1 før P2. Hvis en kilde ikke finnes, registrer hullet og gå videre — ikke stopp hele batchen.

## Per-prompt arbeidsløkke

For hver prompt-ID:

1. Les prompt-blokken i promptpacken og `next_artifact`/`Lagre output`-stien.
2. Hent primærkilder (offisiell statistikk, register, lovtekst, årsrapport, fagrapport). Logg URL og tilgangsdato.
3. Skriv output-fila på `Lagre output`-stien med universal-format: Kort dom, Sterkeste kilde, Svakeste punkt, Funn-tabell (kilde/år/lokator/klasse/caveat), Tomme celler, `Ikke si`, Anbefalt gate.
4. Fatt mottaksbeslutning: `enrich` (importer som kandidat), `park` (stopp claim), eller `actor-gate` (krever aktørdata).
5. Append én linje til `research/_status/food-tg-r13/decisions/batch-NN.jsonl` (schema under).
6. Behold gate fra CSV som default, men nedgrader hvis svakeste punkt krever det (svakeste punkt styrer gate, ikke ønsket bruk).

## Output-kontrakt per batch

Etter hver batch, produser:

1. **Output-filer** — én per prompt på `Lagre output`-stien.
2. **Decision JSONL** — `research/_status/food-tg-r13/decisions/batch-NN.jsonl`, én linje per prompt.
3. **Batch-rapport** — `research/_status/food-tg-r13/report-batch-NN.md` med: header (Dato, Goal, Batch, Regel), Oppsummering (beslutning → antall → IDer), Mottaksrad-tabell (8 kolonner fra mottaksprotokoll §3), og Per-target outcome med verifisert(e) kilde(r) og utfall per ID.
4. **Oppdater intake-indeks** — legg hver prompt-ID i riktig(e) gruppe i `r13-intake-index-2026-06-25.md`, og oppdater Kontrollstatus + Hurtigoppsummering.

### Decision JSONL-schema (én linje per prompt)

```json
{"id":"R13-XXX-NNN","decision":"enrich|park|actor-gate","valueTier":"high|medium|low","title":"...","canonicalPath":"research/external/r13/...","shortVerdict":"2-4 setninger, funn ikke tolkning","strongestSource":"navn, år, lokator","weakestPoint":"hva tåler ikke ekstern bruk","sourceClass":"A | B | C | A with C gaps","gapType":"Type A | Type B | Type C (per relevant celle)","gate":"source-shortlist|PCQ|claim-lock|actor-gate|forstaelse|internal|parkert","importDecision":"importer|vent|parker|aktørspørsmål|claim-lock-kandidat","ikkeSi":["...","..."],"fetchedSources":[{"url":"https://...","accessedAt":"2026-06-25","sourceClass":"primary|secondary|actor-primary|public-filing"}],"fileEdited":true}
```

## Spesielle hensyn for gap-closure-batchen

`R13-GAP-*` lukker kjente R12-hull. Bruk R12-funnene som utgangspunkt:

- **GAP-001 (importnoder):** krever SSB 08801 HS-uttak per node; fosfat og fôrprotein-total var tomme celler i R12 — vis dem.
- **GAP-004 (alt. fôrproteiner):** realisert fôr-grade volum manglet nesten helt i R12 — annonsert kapasitet/plan skal ikke bli realisert volum.
- **GAP-005 (parkerte claims):** behandle ASKO/HORECA 70 %, REKO-tall, andelslandbruk aktiv-telling, SOIL-score, fiskeolje art/sluttbruk og Plantagon/Rest hver for seg; løft kun med uavhengig primærkilde.
- **GAP-006 (type-C-eskalering):** input er R12 intake-indeks; klassifiser hvert hull som Type A/B/C på nytt.

## Definition of done

Goalet er ferdig når:

- alle 50 prompt-IDer har en output-fil på `Lagre output`-stien
- alle 50 har én decision-linje fordelt på `decisions/batch-01..13.jsonl`
- alle 13 batch-rapporter finnes
- intake-indeksen viser «Promptrader indeksert: 50 / 50» og alle grupper er fylt
- ingen output åpner claim, skriver DB, eller bruker `safe_for_ai_context`/whitepaper-stemme
- følgende kontroller er kjørt og grønne:

```bash
# ID/struktur-konsistens
python3 - <<'PY'
import csv, re, json, pathlib
ids=[r["id"] for r in csv.DictReader(open("research/_status/food-tg-research-backlog-2026-06-25.csv"))]
dec=[]
for p in sorted(pathlib.Path("research/_status/food-tg-r13/decisions").glob("batch-*.jsonl")):
    dec += [json.loads(l) for l in p.read_text().splitlines() if l.strip()]
dids=[d["id"] for d in dec]
print("backlog:",len(ids),"decisions:",len(dids),"unique:",len(set(dids)))
print("missing decisions:",sorted(set(ids)-set(dids)))
print("missing output files:",[i for i in ids if not list(pathlib.Path('.').glob(f'**/{i}-*.md'))])
PY

# repo-vakter
npm run audit:research-artifacts -- --base=origin/main
git diff --check
```

## Stop / eskaler til menneske

Stopp og rapporter i stedet for å gjette når:

- en prompt krever lukket aktørdata eller beslutningstilgang (actor-gate) — registrer kravet, ikke et tall
- to kilder gir motstridende primærtall uten metode for å avgjøre
- en kilde ser ut til å kreve betaling, innlogging eller er blokkert — noter som `C`/Type B og gå videre
- output ville måtte åpne et nytt claim for å være nyttig — parker det
````

### research/_status/food-tg-r13/r13-intake-index-2026-06-25.md

````markdown
# Food TG R13 — intern mottaks-/triageindeks

Denne indeksen grupperer Runde 13-prompter etter mottaksstatus. Den bygger på `research/_status/food-tg-r13/report-batch-*.md` og `research/_status/food-tg-r13/decisions/batch-*.jsonl`. Ingen batch-output endres her — indeksen er kun et triagekart.

> **Slik fylles den:** etter hver fullført batch legges hver prompt-ID inn i riktig(e) gruppe(r) nedenfor med kolonnene `ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt`. En prompt kan stå i flere grupper når den har både en hovedgate og en stop-regel (f.eks. PCQ + må ikke visualiseres ennå). Oppdater også Kontrollstatus og Hurtigoppsummering.

## Kontrollstatus

- **Promptrader indeksert:** 50 / 50
- **Decision-batcher funnet:** batch-01 (R13-GAP-001, R13-GAP-005, R13-WASTE-001, R13-GAP-002), batch-02 (R13-GAP-004, R13-GAP-006, R13-GAP-003, R13-WASTE-002), batch-03 (R13-WASTE-003, R13-WASTE-004, R13-WASTE-005, R13-WASTE-007), batch-04 (R13-WASTE-006, R13-WASTE-008, R13-PROT-006, R13-PROT-007), batch-05 (R13-PROT-001, R13-PROT-002, R13-PROT-003, R13-PROT-004), batch-06 (R13-PROT-005, R13-AKTOR-001, R13-AKTOR-002, R13-AKTOR-003), batch-07 (R13-AKTOR-004, R13-AKTOR-005, R13-AKTOR-006, R13-AKTOR-007), batch-08 (R13-AKTOR-008, R13-PROT-008, R13-INNO-001, R13-INNO-002), batch-09 (R13-INNO-003, R13-INNO-004, R13-INNO-005, R13-INNO-006), batch-10 (R13-INNO-007, R13-OKO-001, R13-OKO-002, R13-OKO-003), batch-11 (R13-OKO-004, R13-OKO-005, R13-OKO-006, R13-OKO-007), batch-12 (R13-LAND-001, R13-LAND-002, R13-LAND-003, R13-LAND-004), batch-13 (R13-LAND-005, R13-LAND-006)
- **Batcher ikke funnet som decision/report-fil:** batch-13 (ikke startet)
- **Arbeidsregel:** alle rader er interne mottaks-/triageposter; ingen rad åpner ekstern claim, DB-skriving, `safe_for_ai_context`, whitepapertekst eller deckstemme.
- **Overlapp:** samme prompt kan ligge i flere grupper når den både har en hovedgate og en stop-regel.

## Hurtigoppsummering

| Gruppe | Antall | Bruk |
|---|---:|---|
| PCQ-ready | 14 | klar for primary-check queue / kontrollert uttrekk før eventuell claim-lock |
| source-shortlist | 24 | klar som kilde-/metodekandidat, ikke claim |
| claim-lock candidate | 1 | kun svært smal formulering kan vurderes etter PCQ |
| actor-gate | 8 | krever aktørdata, verifikasjon, kontrakt, avregning eller aktiv-status |
| forstaelse | 4 | bakgrunn/hypotese/mental modell; ikke faktastemme |
| internal only | 3 | intern modell, datakontrakt, funding-fit eller uttakskø |
| parkert | 1 | hele eller sentrale claims stoppet inntil ny locator/aktor/data finnes |
| må ikke visualiseres ennå | 46 | ikke lag ekstern figur/radar/rangering/deckuttak før gate og tomme celler vises |

## PCQ-ready

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-001 | 01 | Kritiske importnoder | PCQ | SSB 08801 gir Type-A importtidsserie 2020–2024 (volum+verdi separat) for soya/fiskeolje/kaffe/kakao; fosfat ≈0 råimport (P via NPK); fôrprotein-total er Type-C metodeluke. | importer (PCQ; speil holdt ute) | research/external/r13/R13-GAP-001-kritiske-importnoder.md |
| R13-GAP-005 | 01 | Verifisering av 7 parkerte R12-claims | PCQ | 3 løftbare m/caveat (REKO 2022, andelslandbruk 93/2023, Rest-konkurs 2024), 1 delvis (fiskeolje), 3 parkert/nedgradert (ASKO 70 %, SOIL-score, Plantagon). | claim-lock-kandidat for smale rader; verifiser per claim | research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md |
| R13-WASTE-001 | 01 | Marint restråstoff R-stige | PCQ | SINTEF/FHF fulltekst: ~1,1 mill. t, 89 % utnyttet, men kun ~15 % humant konsum vs 66 % fôr / ~19 % energi — utnyttet ≠ høyverdi. | importer (PCQ) | research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md |
| R13-WASTE-002 | 02 | Oppdrettsslam massebalanse | PCQ | Offentlige tall er modellerte utslipp (535 412 t slam / 14 000 t P, 2019); innsamlet/behandlet kun fragmenter; åpne merder samler ~0. Ingen 3-kolonners anleggsbalanse i åpne kilder. | vent — parkert til actor/primærdata (se også parkert) | research/external/r13/R13-WASTE-002-oppdrettsslam-massebalanse.md |
| R13-WASTE-004 | 03 | Husholdnings- og detaljmatsvinn | PCQ | NORSUS/Matvett OR.16.24 (husholdning 2023: 193 200 tonn) og OR.28.25 (dagligvare 2024: 43 600 tonn); bransjeavtale og matsvinnlov primærkilder. A-klasse med C-gap (husholdning 2024 mangler, matindustri kun t.o.m. 2022). | importer med synlige caveater og tomme 2024-celler | research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md |
| R13-WASTE-005 | 03 | Digestat NPK-retur | PCQ | Sverige A (SPCR 120 2023: Tot-N ~5,1 / P ~0,60 / K ~2,1 kg/tonn); Norge B/C — ingen nasjonal aggregering, strukturelt hull. | aktørspørsmål til Biogass Norge/NIBIO | research/external/r13/R13-WASTE-005-digestat-npk-retur.md |
| R13-PROT-006 | 04 | Soya/SPC-erstatning i fôr | PCQ | SPC dominerer (~21 % av fôr 2020, Nofima/FHF A-kilde). Fiskemjøl ned fra 65 % (1990) til 12 % (2020). All SPC ProTerra/RTRS-sertifisert via Denofa. Ingen offentlig ressursregnskap etter 2020. | vent — hent nyere Nofima/FHF ressursregnskap 2022/2023 | research/external/r13/R13-PROT-006-soya-erstatning-for.md |
| R13-PROT-007 | 04 | Proteinselvforsyning Norge | PCQ | Rå 41,3 % / fôrkorrigert 34,9 % (2024, energibasis, A). Protein-gram-serie mangler offisiell beregning (C). Fôrkorrigert ekskluderer fiskefôr — strukturelt hull. | vent — aktørspørsmål til NIBIO om protein-gram-serie og akvakulturfôr-korreksjon | research/external/r13/R13-PROT-007-proteinselvforsyning.md |
| R13-AKTOR-006 | 07 | Eierskap og founders i sirkulær/altprotein/CEA | PCQ | Brreg rolledata (A) for 8 aktører: Invertapro, NorInsect, Vestkorn, NoMy, Avisomo, Onna, Vertical Agri. Rest AS bekreftet slettet (konkurs 2024-09-05). Gruten AS ikke funnet. Aksjonærregister C-celle systematisk. | vent — Proff Forvalt/Skatteetaten for aksjonærdata; dsm-firmenich årsrapport for Vestkorn | research/external/r13/R13-AKTOR-006-eierskap-founders.md |
| R13-OKO-001 | 10 | Økologisk areal og produksjon i Norge | PCQ | Norsk øko-areal stabilt ~4,3–4,5 % (2024, inkl. karens), vedvarende nedgang i produsentantall siden 2011–2012. 10%-mål 2032 krever dobling. Øko-salg +17,6 % 2025, men norsk melkeproduksjon faller. Import-vs-norsk andel: C. | **importer** med synlige tomme celler (godkjent/karens-skille; import/norsk) — Debio statistikkhefte 2025 er sterkeste A-kilde | research/external/r13/R13-OKO-001-okologisk-areal-produksjon.md |
| R13-OKO-003 | 10 | Jordhelse og karbon i jord: måleprogrammer og baseline | PCQ | Norge mangler nasjonal SOC-baseline for jordbruksjord. JordVAAK oppstartet 2026, første analyse tidligst ~2036. UNFCCC-karbontall er Tier 1/2-modellert, ikke direkte målt. 39 % av jordbruksareal mangler jordsmonnskart. | vent — JordVAAK tidligst 2029; NIBIO jordsmonnskart (61 % dekning) kan brukes som proxy med caveat | research/external/r13/R13-OKO-003-jordhelse-karbon.md |
| R13-OKO-007 | 11 | Policy-mål for økologi og bærekraft: nasjonale mål, EU F2F og måloppnåelse | PCQ | Riksrevisjonen (jun. 2025): klimamål IKKE i rute. Jordvernmål nådd 2025 (1 763 daa, foreløpig). Øko-areal 4,6 % mot 10 %-mål 2032. Selvforsyning ~40 % mot vedtatt mål 50 %. EU F2F ikke EØS-innlemmet. | **importer** med synlige tomme celler (matsvinn ekskl. primærjordbruk; selvforsyningsprognose; pollinatorbestandsmål) | research/external/r13/R13-OKO-007-policy-mal-okologi.md |
| R13-LAND-001 | 12 | Makt- og eierkonsentrasjon — dagligvare, grossist, foredling og fôr | PCQ | KT Dagligvarerapport 2024 (A): NG 43,5 %, Coop 29,2 %, REMA 23,9 %, Bunnpris 3,3 %. Nortura ~65–70 % rødkjøtt, Tine ~72,9 % melk (2023, A). Grossistprosenter: C. Fiskefôr 2024: C. Kraftfôrandel: C. | **importer** med synlige C-celler (grossistprosenter, fiskefôr, Tine 2024, kraftfôrandel) — KT-rapporten er sterkeste A-kilde | research/external/r13/R13-LAND-001-makt-eierkonsentrasjon.md |
| R13-LAND-002 | 12 | Vertikal integrasjon og kontroll i norsk matsystem | PCQ | 28 integrasjonskoblinger dokumentert fra årsrapporter: NG (ASKO, UNIL, BAMA 46 %), Coop (industri, logistikk), Reitan (Norsk Kylling 100 %, Stange Gård 95 %), Nortura, Tine, Mowi (rogn-til-pakke), FK (Norgesmøllene 2025). 6 tomme celler. | **importer** med 6 navngitte PCQ-tomme celler (Fjordland, Banan II, REMA Distr., Pronofa, Nova Sea, Kaffebrenneriet) | research/external/r13/R13-LAND-002-vertikal-integrasjon.md |

## source-shortlist

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-002 | 01 | Lokale verdikjeder og forsyningssikkerhet | source-shortlist | Lokal/kort kjede øker forsyningssikkerhet kun via navngitt mekanisme (redundans, desentralisert lager, redusert innsatsvare-import) — ikke via identitet; ingen norsk kvantifisering funnet. | vent — kildekort, ikke claim | research/external/r13/R13-GAP-002-lokale-verdikjeder-resiliens.md |
| R13-GAP-004 | 02 | Alternative nordiske fôrproteiner | source-shortlist | Feltet dominert av kapasitet/plan, ikke realisert fôr-grade volum; Enorm (DK) konkurs okt 2025, Solar Foods 160 t/år men mat ikke fôr, Invertapro er mealworm. | aktørspørsmål (realisert volum, se også actor-gate) | research/external/r13/R13-GAP-004-alternative-nordiske-forproteiner.md |
| R13-GAP-003 | 02 | Transport/lager-sårbarhet (mat, Norden) | source-shortlist | Åpent myndighetsmateriale kobler transport/havn/lager/kaldkjede til mat, men overveiende kvalitativt; tallfestet: NO ~60 % importavhengighet, 34–40 % fôrjustert selvforsyning, 82 500 t matkorn (~3 mnd) innen 2029. | importer som kildekort; node-tonnasje forblir C | research/external/r13/R13-GAP-003-transport-lager-sarbarhet.md |
| R13-WASTE-003 | 03 | Matsvinn-redistribusjon | source-shortlist | Matsentralen 5 735 tonn omfordelt 2024 (primær/aktørrapport B). TGTG norsk 2024-statistikk ikke offentliggjort (C). Ingen nasjonal redistributionstotal mulig uten metodebro. | vent — hold til TGTG og Matvett publiserer oppdaterte per-kanal-tall | research/external/r13/R13-WASTE-003-matsvinn-redistribusjon.md |
| R13-WASTE-007 | 03 | Industrielle næringssidestrømmer | source-shortlist | Nofima 67/2016 gir samlede estimater (bryggeri ~17 000 tonn mask, slakteri ~264 000 tonn), men utdatert (~10 år). Meieri-tall aktørformidlet uten verifiserbar primærkilde. Per-fraksjon-celler tomme. | vent — hent Nofima-fulltekst, TINE-årsrapport og SSB 14458 | research/external/r13/R13-WASTE-007-industrielle-sidestrommer.md |
| R13-WASTE-006 | 04 | Kaffegrut og urbane sidestrømmer | source-shortlist | SCG-volum estimert til 70 000–84 000 t/år vått (B, avledet). Ingen separat SSB-fraksjon. Mesteparten i matavfallsstrøm (R3/R9). Gruten AS marginalt. HORECA-data er C. | vent — kjør SSB 08801 API for kaffeimport; kartlegg HORECA-etterlevelse | research/external/r13/R13-WASTE-006-kaffegrut-urbane-sidestrommer.md |
| R13-WASTE-008 | 04 | Prevention-tiltak med baseline | source-shortlist | Bransjeavtale/KuttMatsvinn gir sektorbaseline (2015/2017), men ingen studie isolerer enkelt-tiltak (R1) med kontrollgruppe. Matsvinnloven (juni 2025) strukturelt tiltak uten effektdata. Dagligvare –47 % er sterkest dokumentert. | vent — PCQ per tallfestet effektutsagn; hent Nordic Council Nord 2024:034 fulltekst | research/external/r13/R13-WASTE-008-prevention-baseline.md |
| R13-PROT-001 | 05 | Insektprotein aktørledger | source-shortlist | Insektprotein i Norge/Norden er FoU/pilot/kapasitet/regulatorisk mulighet, ikke åpen realisert fôrvolumserie; Invertapro er sterkt aktøranker, men ingen tonnasje. | importer som aktør-/regelverksledger; volum til actor-gate/PCQ | research/external/r13/R13-PROT-001-insektprotein.md |
| R13-PROT-002 | 05 | Single-cell og fermenteringsprotein | source-shortlist | Unibio har fôrrelevant førsteforsendelse og Solar Foods har matprotein-kapasitet, men kapasitet/LOI/førsteforsendelse er ikke kontinuerlig nordisk årsvolum. | importer som teknologi-/aktørledger; hold mat og fôr separat | research/external/r13/R13-PROT-002-single-cell-fermentering.md |
| R13-PROT-003 | 05 | Musling, tang og tare | source-shortlist | FHF/Nofima/HI gir FoU-anker for blåskjellprotein, men prosjektmål og potensial er ikke realisert fôrvolum; tang/tare/mikroalger mangler kommersiell volumserie. | importer som FoU-/datagapledger, ikke volumclaim | research/external/r13/R13-PROT-003-musling-tang-tare.md |
| R13-PROT-004 | 05 | Plantebasert humanprotein | source-shortlist | Nofima/NIBIO/Landbruksdirektoratet gir markeds- og råvareankre, men ikke én åpen tabell for produkt, volum, markedsandel og råvareopprinnelse. | importer som marked-/råvareprofil med C-felt | research/external/r13/R13-PROT-004-plantebasert-humanprotein.md |
| R13-AKTOR-003 | 06 | REKO-ringer oppdaterte tall | source-shortlist | Primærtall fryst ved feb. 2022 (rekonorge.no: >140 ringer, ~500 000 kunder, >600 produsenter, B-klasse). REKO Norge stiftet jan. 2025 men ingen årsmelding per juni 2026. | vent — kontakt REKO Norge; sjekk DIGIFOOD-sluttrapport (USN) | research/external/r13/R13-AKTOR-003-reko-ringer-tall.md |
| R13-AKTOR-008 | 08 | Lokalmat-distribusjon og REKO-alternativer | source-shortlist | 938 mill. kr direktesalg 2025 (A, Lokalmatrapport 2025). Godt Lokalt/DLVRY >1 mrd. kr (A). Kanaldekomponering ikke offentlig (C). Digitale plattformer uten omsetningstall (B/C). | vent — kanaldekomponering mangler; kontakt Stiftelsen Norsk Mat og Bondens marked for per-kanal-tall | research/external/r13/R13-AKTOR-008-lokalmat-distribusjon.md |
| R13-PROT-008 | 08 | Norsk dyrking av bønner, erter og åkerbønne | source-shortlist | Samlet belgvekstareal ~86 000 daa 2024 (B, NIBIO). Nesten all produksjon til kraftfôr. Volumtall (tonn) mangler som SSB-serie (C). Landbruksdirektoratets rapport feb. 2026 utreder virkemidler — ingen tilskudd vedtatt. | vent — hent SSB tabell 07495 belgvekster; les rapport 3-16/2026 fulltekst | research/external/r13/R13-PROT-008-bonner-erter-akerbonne.md |
| R13-INNO-001 | 08 | CEA og vertikalt landbruk i Norge | source-shortlist | Onna Greens: NOK 17,5 mill. omsetning 2024, -9,6 mill. driftsresultat (A). Himmelgrønt (Coop/Avisomo JV): 100 t/år mål, i butikk 2026 (B), regnskap ukjent (C). Ingen aktør med realisert produksjonsvolum i åpen kilde. | vent — Himmelgrønt org.nr. i Brreg; Coop-årsrapport 2025; aktørspørsmål til Onna Greens | research/external/r13/R13-INNO-001-cea-vertikalt-landbruk.md |
| R13-INNO-002 | 08 | Agritech/foodtech-økosystem Norge | source-shortlist | NCE Heidner Biocluster: 50+ medl., NOK 66 mrd. membersmasse-omsetning (A). Nofence €30M Series B 2025, Saga Robotics €9,5M 2025 (B). Stortinget: nasjonal agritech-strategi bestilt mai 2025, ikke fremlagt. Aggregert VC-kapital mangler offentlig kilde (C). | vent — nasjonal strategistatus; NIC-klyngedatabase; Dealroom NO for kapitalstatistikk | research/external/r13/R13-INNO-002-agritech-okosystem.md |
| R13-INNO-007 | 10 | Offentlig innovasjonsetterspørsel: mat og kommunale piloter | source-shortlist | Oslo kommune FUSILLI (2021–2024) og 46-tiltaksplan (2023) er sterkeste caser. DFØ-veiledning for lokalprodusert mat i anskaffelser (A, 2025). LUP/Innovative anskaffelser: ingen mat-case i aktiv portefølje per juni 2026. Doffin og Forsvaret: C. | vent — LUP-arkiv direkte; Doffin systematisk søk; Oslo Bymiljøetat for FUSILLI-implementeringsstatus | research/external/r13/R13-INNO-007-offentlig-innovasjon.md |
| R13-OKO-004 | 11 | Biodiversitet i jordbrukslandskap — indikatorer, kilder og trend | source-shortlist | Fugler ned ~25 % siden 2000 (3Q/NIBIO 2026, DOI). Naturindeks 2025: åpent lavland = 0,445, lavest av alle 7 økosystemer. 60 % av semi-naturlig eng i gjengroing (ASO/NIBIO 2026). Pollinatortrend: for kort serie (fra 2021). Insektbiomasse i åker: C. | **importer** — sterk A-kildedekning for fugler og naturtyper; tomme celler for pollinatortrend og insekter synlige | research/external/r13/R13-OKO-004-biodiversitet-jordbruk.md |
| R13-OKO-005 | 11 | Sertifiserings- og merkeordninger for mat i Norge | source-shortlist | Debio: 3 018 godkjente virksomheter 2025 (A). Nyt Norge: 6 100 produkter / 43 mrd. NOK 2024 (A). Distinksjon: Nyt Norge = opprinnelse (ikke miljø). Stiftelsen Norsk Mat er privat stiftelse. Kontroll via egenrevisjon. | **importer** — primærkildedekning god; tomme celler for Debio avgift, USDA-ekvivalens, BOB/BGB-liste 2025 | research/external/r13/R13-OKO-005-sertifisering-merkeordninger.md |
| R13-OKO-006 | 11 | Beite, utmark og husdyr-økologi | source-shortlist | 1,3 mill. sau/lam + 270 000 storfe + 63 000 geit på utmarksbeite 2025 (SSB, A). Metan = 48,5 % av jordbruksutslipp (NID 2025, Tier 2, GWP100/AR5). SOC i utmark: utenfor inventaret, endringsdata tidligst 2033. | **importer** — solid A-kildedekning for areal og utslipp; SOC-gap eksplisitt dokumentert | research/external/r13/R13-OKO-006-beite-utmark-husdyr.md |
| R13-LAND-005 | 13 | Bevegelse- og nettverkskart — regenerativ/lokalmat/øko | source-shortlist | 19 nettverkskoblinger (A fra org.sider): Økologisk Norge drifter andelslandbruk.no; GMO-nettverket = paraply for 18 medl. + 3 støttemedl. med styreoverlapp; Bondens marked stiftet av Oikos/Bondelaget/NBS m.fl.; KVANN spunnet ut av NIBIO/Hageselskapets Planteklubber. Oikos→Økologisk Norge (2018). | vent — kildekort; Slow Food-status, KVANN org.nr/permakultur-link og Bondens marked-stifterskap (B) er C/uverifisert | research/external/r13/R13-LAND-005-bevegelse-nettverkskart.md |

## claim-lock candidate

| ID | Batch | Tittel | Gate | Kort dom | Triagebeslutning | Artefakt |
|---|---:|---|---|---|---|---|
| R13-GAP-005 | 01 | Verifisering av 7 parkerte R12-claims | PCQ → claim-lock | Kun de smaleste radene med uavhengig primær (Rest-konkurs 2024, andelslandbruk 93/2023) er claim-lock-kandidater; ASKO 70 % og SOIL-score blir IKKE claims. | smal claim-lock kun etter PCQ, per rad | research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md |

[Excerpt clipped for NotebookLM retrieval quality. See source path for full file.]
````

### research/RESEARCH-MISSIONS.md

````markdown
# Research Missions: Food Systems Transition Group

**Prepared for:** Gabriel Freeman & Cathrine Barth
**Date:** 11 March 2026
**Purpose:** Structured field research tasks that require human action outside Claude Code
**How to use:** Complete missions in priority order. Return results in the specified format so they can be integrated immediately into the whitepaper and Evidence Pack.

---

## Priority Overview

| # | Mission | Priority | Blocks | Est. Time | Evidence Pack |
|---|---------|----------|--------|-----------|---------------|
| 1 | Stakeholder Interviews | A — Critical | Whitepaper §3, §5, §6 | 2–3 weeks | — |
| 2 | Nordic Partner Data Validation | A — Critical | Whitepaper §4, Fig 6–9 | 1–2 weeks | — |
| 3 | TG Charter + Stakeholder Mapping Workshop | A — Critical | Evidence Pack #1, #3 | 1 session + follow-up | #1, #3 |
| 4 | Open Data Retrieval | B — Strengthens | Municipal HHI, Nordic comparison | 1–2 weeks | — |
| 5 | Regulatory Document Collection | B — Strengthens | Whitepaper §5, policy brief | 1 week | #5 |
| 6 | Pilot Concept Development Workshop | C — Phase 2 | Pilot briefs | 1 session | #4 |
| 7 | Finance & Funding Landscape Scan | C — Phase 2 | Roadmap, funding strategy | 1–2 weeks | #6 |

---

## VK-4 — Obsidian Gap Missions

Disse mission-radene er koblet direkte til norske gap-noder i `Food Systems Obsidian/10 Innsiktskart/Gaps/`. De er ikke claim-lockede funn; de er arbeidsoppdrag som skal fylle gap-nodene med data eller tydelig stoppe på manglende primærkilder.

| Mission ID | Gap-node | Prioritet | Spørsmål som må besvares | Forventet returformat |
|---|---|---|---|---|
| VK4-GAP-001 | Gap – Biogass kapasitetsgap Norge vs Danmark | A | Hva forklarer forskjellen mellom norsk og dansk biogasskapasitet, og hvilke tall er primærkildebasert sammenlignbare? | Kort notat med kilder, tall, land-sammenligning og usikkerhet. |
| VK4-GAP-002 | Gap – Fiskeavfall kastet i havet | A | Hvor mye marint restråstoff/fiskeavfall går tapt, og hvilke deler kan realistisk løftes i R-stigen? | Kildenotat med volum, avgrensning og relevante aktører. |
| VK4-GAP-003 | Gap – Matsentralen kapasitetsgap | B | Hva er faktisk kapasitetsgap i matredistribusjon, og hvilke barrierer er logistikk, finansiering eller regelverk? | Mission-notat med baseline, flaskehalser og mulige partnere. |
| VK4-GAP-004 | Gap – Mikroplast i biorest blokkerer gjodselbruk — gron pose-problemet | A | Hvilke dokumenterte kvalitetsbarrierer hindrer biorest som gjødsel, og hva er dokumentert effekt av pose-/plastproblemet? | Kildenotat med regelverk, kvalitetskrav og sitatbare kilder. |
| VK4-GAP-005 | Gap – Norge mangler AX Foundation-ekvivalent for for-innovasjon | B | Finnes norske eller nordiske institusjoner som kan fylle AX Foundation-rollen for fôrinnovasjon? | Aktørkart med kandidater, roller og kontakt-/ask-felt. |
| VK4-GAP-006 | Gap – Oppdrettsslam valorisering | A | Hvilke teknologier og regulatoriske betingelser er mest modne for oppdrettsslam til gjødsel, biokull eller biogass? | Teknologinotat med TRL, kilder og pilotkandidater. |
| VK4-GAP-007 | Gap – Samlet norsk naeringsstoff-resirkuleringsgap | A | Del opp næringsstoffgapet per strøm og per N/P/K: hva er realisert, modellert, potensial eller plan, og hvilke celler mangler primærkilde? | Claim-lock-notat med N/P/K-strømtabell, kilder, tomme celler og beslutning. |
| VK4-GAP-008 | Gap – Svartvann-fosfor kun 20-23% gjenvunnet (Norge) | B | Hva er beste norske baseline for fosforgjenvinning fra svartvann/avløp, og er 20-23% rett nivå? | Kildenotat med tallserie og metodeforbehold. |
| VK4-GAP-009 | Gap – Svartvann-nitrogen ikke gjenvunnet (Norge) | B | Hva er status for nitrogengjenvinning i norske avløpssystemer, og hvilke teknologier er realistiske? | Kildenotat med teknologier, barrierer og kilder. |
| VK4-GAP-010 | Gap – Husdyrgjodsel-N tap til luft/vann (Norge) | B | Hvor stort er nitrogen-tapet fra norsk husdyrgjødsel til luft/vann, og hvilke tiltak har best dokumentert effekt? | Kildenotat med baseline, virkemiddelvurdering og metodeforbehold. |
| VK4-GAP-011 | Gap – N/P/K fra oppdrett til fjord — 70% av fornaringsstoffer tapt | A | Kan N/P/K-tap fra norsk oppdrett kvantifiseres med primærkilder, og hvilke fangst-/gjenvinningsteknologier er realistiske? | Claim-lock-notat med utslippsbaseline, teknologistatus og usikkerhet. |
| VK4-GAP-012 | Gap – N/P/K i matsvinn til forbrenning — naeringsstoffer tapt | B | Hvor mye N/P/K går tapt når matavfall forbrennes fremfor behandles som organisk ressurs, og hvilke policygrep endrer flyten? | Kildenotat med volum, systemgrense og sammenlignbare nordiske løsninger. |

---

## Priority A — Critical Path (Blocks June 2026 Delivery)

---

### Mission 1: Stakeholder Interviews

**Objective:** Collect direct quotes and first-person perspectives from 4–5 key actors to transform the data-driven whitepaper into a compelling narrative with human voices.

**Why this matters:** The whitepaper (v1.1) has strong quantitative foundations — 134-month price series, HHI calculations, Nordic comparison — but zero direct quotes. Reviewers and policymakers respond to human stories. Without stakeholder voices, §3 (Norwegian deep-dive), §5 (regulatory landscape), and §6 (transition levers) read as academic analysis rather than lived experience.

**Target interviews:**

#### Interview 1A: Supplier or Producer (Fear Culture)

**Goal:** A first-person account of operating under the triopoly — illustrating the "fear culture" referenced in Dagligvaretilsynet's reports (89–95% of suppliers know about Lov om god handelsskikk but almost none use it).

**How to find:** Contact Norsk Nærings- og Nytelsesmiddelarbeiderforbund (NNN), or reach out through NCH/Natural State network for a mid-size food producer willing to speak. Consider someone in the fruit/vegetable supply chain (96% import dependency makes this segment particularly vulnerable).

**Interview questions:**
1. Can you describe a specific situation where a chain's purchasing power affected your business decisions?
2. How do fixed fees, shelf placement charges, or joint marketing contributions affect your margins? Can you give a concrete example?
3. Are you aware of Lov om god handelsskikk? Have you considered using it? What stops you?
4. If a new chain or distribution channel emerged, how would that change your business?
5. What would "fair" look like in your relationship with retailers?
6. Is there anything you want policymakers to understand about the supplier experience?

**Anonymity note:** Offer full anonymity. Use "a mid-size Norwegian food producer" in the whitepaper if needed. The fear of delisting is real — do not pressure anyone to go on record.

#### Interview 1B: Anders Nordstad (Infrastructure Thesis)

**Goal:** Direct commentary on his thesis that market power is exercised through opaque infrastructure control (ASKO, Rema Distribution, C-Log), not transparent price gouging. The whitepaper's "Nordstad-Gaasland synthesis" (§6.2) needs his voice.

**How to find:** Anders Nordstad is publicly active — Aftenposten op-eds (July 2024), media appearances. Reach out directly via LinkedIn or through journalist contacts.

**Interview questions:**
1. You've argued that the real power lies in infrastructure control, not shelf prices. Can you summarize the core mechanism for a Nordic policy audience?
2. The Prisjeger fine (NOK 4.9 billion, August 2024) addressed price coordination. Does it touch the structural issue you've identified?
3. How would "open logistics access" — regulated third-party access to ASKO/Rema/C-Log networks — work in practice? What's the telecom analogy?
4. Our data shows three closed logistics networks serving 93% of stores, with 254,000+ m² of warehouse capacity as entry barrier. Does this match your analysis?
5. What's the one policy intervention that would have the greatest structural impact?

#### Interview 1C: NMBU Academic (System Dynamics)

**Goal:** Scholarly framing of system dynamics, attractor states, and feedback loops. Strengthens the theoretical framework in §6.1.

**How to find:** NMBU Arena for Sustainable Food Systems. Look for researchers in agricultural economics, food systems, or competition policy. Potential contacts: anyone in the food systems group connected through NCH's original NI application (NMBU was a listed partner).

**Interview questions:**
1. Our analysis models the Norwegian grocery market as a "stable attractor state" — a three-player configuration the system gravitates toward. Does this framing resonate with your research?
2. What structural changes would be needed to shift the system to a new equilibrium?
3. How does Norway's 44% self-sufficiency rate interact with market concentration? Is the "double vulnerability" thesis defensible?
4. What's missing from the current policy debate about food system concentration?
5. Are there international examples (beyond the Nordics) where highly concentrated food retail markets were successfully reformed?

#### Interview 1D: Konkurransetilsynet Contact (Enforcement Data)

**Goal:** Clarify enforcement capacity, the proposed Dagligvaretilsynet merger, and whether a Finnish §4a model has been considered.

**How to find:** Konkurransetilsynet is a public authority — contact their communications department or look for the case handler on the Prisjeger case. Alternatively, request a "background conversation" (bakgrunnssamtale) through official channels.

**Interview questions:**
1. The 2026 state budget proposes transferring Dagligvaretilsynet responsibilities to Konkurransetilsynet. How does this affect your enforcement capacity?
2. Finland's §4a automatically deems grocery retailers with 30%+ market share as dominant. Has this model been evaluated for Norway?
3. What tools do you currently lack that would strengthen grocery market oversight?
4. Our data shows zero enforcement decisions under Lov om god handelsskikk in five years. What explains this?
5. The new market investigation powers (July 2025) — have they been applied to grocery retail?

#### Interview 1E (Optional): Einar or Martin (NCH Leadership)

**Goal:** Strategic framing of Nordic collaboration and NCH's role.

**Questions:**
1. What does success look like for the Food Systems TG by June 2026?
2. How does food systems fit with NCH's broader transition group portfolio?
3. What's the Nordic value-add that a purely Norwegian effort would miss?

**Return format:**
- One document per interview (or a single combined document with clear section breaks)
- Structure each interview as:
  - **Interviewee:** Name/role (or "Anonymous supplier") + date
  - **Key quotes:** Mark direct quotes with quotation marks and note which whitepaper section they support (§3, §5, §6)
  - **Summary insights:** 3–5 bullet points of main takeaways
  - **Surprises:** Anything that contradicts or adds to our current analysis
- File naming: `research/interviews/interview-[identifier]-[date].md`

**What happens when results return:**
- Direct quotes inserted into whitepaper §3 (fear culture), §5 (enforcement paradox), §6 (Nordstad thesis)
- Narrative intros written for key sections using first-person voices
- Any new data points integrated into analysis
- Contradictions flagged and investigated

---

### Mission 2: Nordic Partner Data Validation

**Objective:** Send our Nordic comparison data to Michel Bajuk (Sweden/Cradlenet) and Betina Simonsen (Denmark/LDCluster) for confirmation, correction, and enrichment.

**Why this matters:** Our Nordic market data (whitepaper §4.1) uses estimates with ±2–3% uncertainty from NHH FOOD, Statista, and national authorities. Partner validation converts "estimated" to "confirmed" and may reveal data we've missed.

**What to send — The data table for validation:**

Share the following table with both partners, asking them to confirm, correct, or annotate each cell for their country:

| Metric | Denmark (Betina) | Sweden (Michel) | Finland (for reference) | Norway (our data) |
|--------|-------------------|-----------------|------------------------|-------------------|
| Dominant player | Salling Group ~35% | ICA Gruppen ~50% | S Group ~49% | NorgesGruppen 44% |
| #2 player | Coop DK ~29% | Axfood ~25% | K Group ~34% | Coop NO ~29% |
| #3 player | Rema 1000 ~14% | Coop SE ~14% | Lidl ~9% | Rema 1000 ~24% |
| Top-3 share | ~78% | ~89% | ~92% | ~97% (revenue) |
| Estimated HHI | ~2,500 | ~3,300 | ~3,600 | ~3,400 |
| Concentration trend | Decreasing | Increasing | Stable/high | Stable/high |
| International players | Lidl ~5% | Lidl 6–7% | Lidl ~9% | None |
| Caloric self-sufficiency | ~300% | ~50% | ~80% | ~44% |
| Grocery-specific regulation | No | No | Yes (§4a) | Yes (handelsskikk) |
| Cooperative share | Coop DK ~29% | Coop SE ~14% | S Group ~49% | Coop NO ~27% |

**Specific questions for Betina Simonsen (Denmark):**
1. After Aldi's exit (January 2024) — how were the ~100 stores redistributed? Our estimate: split among Rema, Salling, Coop, and Lidl. Can you confirm the approximate split?
2. Salling Group's acquisition of 35 Coop stores (approved March 2025) — does this change the market shares above?
3. Denmark's declining concentration trend — is this still holding in 2025/2026?
4. Is there a specific data source we should cite for Danish market shares? (We currently use KFST + Statista.)
5. Any other corrections or context?

**Specific questions for Michel Bajuk (Sweden):**
1. Coop Sverige's SEK 2.7 billion operating loss (2024) — is this figure correct? What's Coop's current trajectory?
2. Axfood's acquisition of City Gross (November 2024, SEK 2 billion) — is this now integrated? Updated market share?
3. Our model predicts Sweden moving toward ICA + Axfood duopoly (~75% combined). Does this match the Swedish conversation?
4. Konkurrensverket Report 2024:5 — any follow-up actions or policy changes since publication?
5. Any other corrections or context?

**How to send:**
- Email with the table and questions
- Subject line suggestion: "Nordic Food Systems Research — Data Validation Request (NCH Transition Group)"
- Offer a 20-minute call if they prefer to discuss rather than write

**Return format:**
- The annotated data table (corrections in bold or tracked changes)
- Answers to country-specific questions
- Any additional data sources or contacts they recommend
- File: `research/norden/partner-validation-[country]-[date].md`

**What happens when results return:**
- Whitepaper §4 updated with confirmed figures
- Confidence intervals narrowed or removed where confirmed
- Figures 6–9 (Nordic comparisons) regenerated with validated data
- New sources added to Citation Log
- Any corrections cascade-checked through the full whitepaper

---

### Mission 3: TG Charter + Stakeholder Mapping Workshop

**Objective:** In a single working session (Gabriel + Cathrine + Einar), produce the TG Charter and initial Stakeholder Commitment Map — Evidence Pack items #1 and #3.

**Why this matters:** The charter frames the entire project. Without it, the Evidence Pack is incomplete and the June 2026 delivery lacks organizational legitimacy. The stakeholder map determines who to mobilize.

**Pre-session preparation:**
- Book 2–3 hours with Gabriel, Cathrine, and Einar
- Print this section as a workshop guide
- Have the whitepaper executive summary available for reference

#### Part A: TG Charter (Evidence Pack #1)

Fill in each section. The charter should be exactly 1 page when formatted.

**FOOD SYSTEMS TRANSITION GROUP — CHARTER**

**North Star (1 sentence):**
_What is the ultimate outcome this TG exists to achieve?_
Example prompt: "By [year], Nordic food systems will..."

**Mandate (2–3 sentences):**
_What has the TG been authorized to do? By whom? With what resources?_
Prompts:
- What is NCH authorizing this TG to investigate/propose/deliver?
- What is explicitly outside scope?
- What budget/resources are allocated?

**Problem Statement (2–3 sentences):**
_What specific problem does this TG address?_
Suggested framing based on whitepaper: "Three companies control 93.4% of Norwegian grocery stores. Market concentration (HHI 3,438) is 37.5% above the international threshold. Self-sufficiency at 44% creates double vulnerability. The current regulatory toolkit has produced zero enforcement decisions in five years."

**Success Criteria (3–5 measurable outcomes):**
_How will we know the TG succeeded?_
Prompts:
- By June 2026, we will have delivered: [list deliverables]
- By December 2026, we will have achieved: [list outcomes]
- The NCH board will consider this TG successful if: [criteria]

Suggested criteria to discuss:
1. Whitepaper finalized and published
2. Concept note with [N] committed partners
3. [N] stakeholder commitments secured
4. [N] pilot concepts scoped
5. Follow-on funding application submitted

**Core Team:**

| Name | Role | Organization | Commitment |
|------|------|-------------|------------|
| Gabriel Freeman | | Natural State | |
| Cathrine Barth | | Natural State | |
| Einar Kleppe Holthe | | Natural State / NCH | |
| Martin Hagen | | Natural State / NCH | |

**Timeline:**
- Phase 1 (Jan–June 2026): Insight report and mobilization
- Phase 2 (June–Dec 2026): [define]
- Phase 3 (2027): [define]

**Governance:**
- Decision-making model: [consensus / majority / lead decides]
- Meeting rhythm: [weekly / biweekly / monthly]
- Reporting to: [NCH board / other]

#### Part B: Stakeholder Commitment Map (Evidence Pack #3)

**Step 1: List stakeholders**
Start by listing all relevant actors. Use this seed list and add/remove as needed:

| # | Stakeholder | Type | Known Contact |
|---|------------|------|---------------|
| 1 | Konkurransetilsynet | Regulator | (identify contact) |
| 2 | Dagligvaretilsynet | Regulator | (identify contact) |
| 3 | NMBU — Food Systems Group | Academic | (from NI application) |
| 4 | Nordic Edge | Network | (NCH connection) |
| 5 | Vestland grønn region | Public | (NCH connection) |
| 6 | NHH FOOD Research Centre | Academic | — |
| 7 | Nordic Innovation | Funder |

[Excerpt clipped for NotebookLM retrieval quality. See source path for full file.]
````

