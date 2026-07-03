---
tittel: Food TG — Research Runde 14 GOAL (Codex autonom kjøring)
status: Kjørbar goal — intern research + kontrollert datainnhenting, åpner ingen eksterne claims
eier: Gabriel
dato: 2026-07-03
scope: >
  Arbeid ned alt gjenstående etter R13-triagen, VK-5-reviewen (lukket 2026-07-03) og
  MVK-dekningskartet: PCQ-oppfølging, claim-lock-kandidater, de fem aktiverte
  VK-4-datarundene, MVK-domenefylling, etterkontroll-køen og actor-gate-forberedelse
  (kun til kandidatliste-nivå, bak G1).
bruksregel: >
  Ingen eksterne claims, ingen `safe_for_ai_context`, ingen whitepaper-/deck-stemme.
  Desk-research-spor (A, B2-deler, D, E) er DB-frie. Datainnhentings-spor (B1–B3, C)
  bruker KUN etablerte importskript og gates med `npm run db:audit`. All ekstern bruk
  går fortsatt gjennom source-shortlist → PCQ → claim-lock → citable/overclaim-gate.
relaterte_filer:
  - docs/project/status/INTERNT-GJENSTAAENDE-RESEARCH-OG-DATA-2026-06-29.md
  - research/_status/food-tg-r13/r13-intake-index-2026-06-25.md
  - research/_status/food-tg-r13/HANDOVER-r13-continuation-2026-06-27.md
  - docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md
  - docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md
  - research/_status/mvk-completeness-dashboard.md
  - research/_status/domene-dekning-hull-2026-06-27.md
  - research/_status/mvk-review-koe-2026-06-27.csv
  - docs/project/mandates/food-tg-research-runde13-goal-codex-2026-06-25.md
  - docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md
  - docs/project/mandates/R13-LAND-004-datagap-atlas.md
  - research/RESEARCH-MISSIONS.md
---

# GOAL: Execute Food TG Research OS Runde 14 (autonom)

## Goal-setning

R13 (50/50 prompts) er kjørt og triagert; VK-5-reviewen er lukket 2026-07-03 med fem
aktiverte datarunde-kandidater (Gabriels beslutning 2026-07-03). Runde 14 arbeider ned
det som faktisk gjenstår: (1) PCQ-verifisering og kontrollert uttrekk av R13-funn merket
«importer», (2) claim-lock-vurdering av de smale kandidatene fra R13-GAP-005, (3) de fem
VK-4-datarundene, (4) MVK-domenefylling etter vedtatt sekvens (handel-dagligvare →
foredling-industri), (5) etterkontroll-køen på 22 flaggede registernoder, og (6)
forberedelse av alt actor-gate-arbeid til — men ikke gjennom — G1-linja.

Goalet er ferdig når hver oppgave i batch-tabellen har output-artefakt, decision-rad og
intake-rad, alle DB-berørende spor har grønn `db:audit`, og repo-vaktene er grønne.

## Inndata (les disse først)

1. **Gjenstående-status** — `docs/project/status/INTERNT-GJENSTAAENDE-RESEARCH-OG-DATA-2026-06-29.md`
   (kanonisk «hva står igjen»-lag; beslutningsutkastene i §8 er styrende for sekvens).
2. **R13 intake-indeks** — `research/_status/food-tg-r13/r13-intake-index-2026-06-25.md`
   (gate- og importbeslutning per R13-funn; fasit for spor A).
3. **VK-5-protokollen** — `docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md`
   (§7–8: aktiverte datarunder og parkerte figurbeslutninger; fasit for spor B).
4. **MVK-dashboard + hull-rapport** — `research/_status/mvk-completeness-dashboard.md` og
   `research/_status/domene-dekning-hull-2026-06-27.md` (fasit for spor C-universer).
5. **Review-kø** — `research/_status/mvk-review-koe-2026-06-27.csv` (etterkontroll-noder, flagg-kolonnen).
6. **Mottaksprotokoll** — `docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md`
   (A/B/C-klasser, hulltyper, gates — uendret fra R13).
7. **Datagap-atlas** — `docs/project/mandates/R13-LAND-004-datagap-atlas.md` (oppdateres løpende i denne runden).

## Gating-status (uendret — respekteres av alle spor)

| Gate | Status 2026-07-03 | Konsekvens for R14 |
|---|---|---|
| **G1** Formelt scope-vedtak (spor A+B, C-gate) | Ikke fattet | Actor-gate-mål forberedes KUN til kandidatliste + source-shortlist (spor D). Ingen aktørkontakt, ingen intervjuer, ingen PCQ på aktørdata. |
| **G2** Dataunderlag fra JT | Ikke levert | Ledd-profiler/true-cost-tallgrunnlag mates ikke; ikke vent på G2 for noe i denne runden. |
| **G3** Metodevalidering true-cost | Ikke gjennomført | M3/M7 kjøres kun som internt metodearbeid (spor E3); ingen ekstern bruk. |

Bevisste blindsoner står: **N7 etterspørsel** og **N9 helse/true-cost** åpnes ikke.
N11 bondemargin er formelt lukket «delvis dekket» (2026-06-29) — ikke gjenåpne;
per-kg-margin forblir Type B bak G1.

## Harde regler (arvet fra R13, med ett tillegg)

1. **Primærkilde først.** Sekundær-/speilkilde bare når primær mangler, og merk `B`.
2. **Ikke gjett.** Tomme celler og dokumentert fravær er gyldige funn.
3. **Skill kildeklasse `A`/`B`/`C` per funn**, ikke bare per dokument.
4. **Skill realisert volum, kapasitet, plan, potensial og hypotese.**
5. **Hver output ender i én gate:** source-shortlist, PCQ, claim-lock, actor-gate, forstaelse, internal eller parkert.
6. **Lag alltid en `Ikke si`-liste.** Mangler den, er importbeslutning `vent`.
7. **Ingen `safe_for_ai_context`, ingen claim-åpning, ingen whitepaper-/deck-tekst.**
8. **DB-skriving er tillatt KUN i spor B1–B3 og C**, kun via etablerte importskript
   (`db:import:*`, `import-brreg-financials.ts`, MVK-importløypa), alltid fulgt av
   `npm run db:audit`. Desk-spor (A, D, E) forblir DB-frie.
9. **Svakeste punkt styrer gate**, ikke ønsket bruk. Parker heller enn å overclaime.
10. **Ikke løft ASKO/HORECA 70 % eller SOIL-score** (eksplisitt R13-beslutning).

---

## Spor A — R13-oppfølging (PCQ, claim-lock, vent-items)

### A1. PCQ-pass på «importer»-merkede funn (P0)

Kjør primary-check queue (URL-spot + aritmetikk + locator-verifikasjon per rad) på
funnene intake-indeksen merket «importer», med synlige tomme celler bevart:

| Oppgave | Kilde-artefakt | Kjent svakhet som må stå synlig |
|---|---|---|
| A1.1 R13-GAP-001 importnoder | `research/external/r13/R13-GAP-001-kritiske-importnoder.md` | Fosfat ≈0 råimport (P via NPK); fôrprotein-total er Type-C metodeluke |
| A1.2 R13-WASTE-001 marint restråstoff | `research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md` | «Utnyttet ≠ høyverdi»: ~15 % humant konsum vs 66 % fôr |
| A1.3 R13-WASTE-004 matsvinn | `research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md` | Husholdning 2024 mangler; matindustri kun t.o.m. 2022 |
| A1.4 R13-OKO-001 økologisk areal | `research/external/r13/R13-OKO-001-okologisk-areal-produksjon.md` | Godkjent/karens-skille; import/norsk-andel er C |
| A1.5 R13-OKO-007 policy-mål | `research/external/r13/R13-OKO-007-policy-mal-okologi.md` | Matsvinn ekskl. primærjordbruk; selvforsyningsprognose mangler |
| A1.6 R13-LAND-001 maktkonsentrasjon | `research/external/r13/R13-LAND-001-makt-eierkonsentrasjon.md` | Grossistprosenter, fiskefôr 2024, Tine 2024, kraftfôrandel = C |
| A1.7 R13-LAND-002 vertikal integrasjon | `research/external/r13/R13-LAND-002-vertikal-integrasjon.md` | 6 navngitte tomme celler (Fjordland, Banan II, REMA Distr., Pronofa, Nova Sea, Kaffebrenneriet) |

Per oppgave: verifiser hver A-kilde-lokator på nytt, re-kjør aritmetikk uavhengig, skriv
PCQ-notat til `research/_status/food-tg-r14/pcq/`, og fatt beslutning
`pcq-bekreftet | nedgrader | parker` per rad. PCQ-bekreftede rader blir claim-lock-**kandidater** —
selve claim-åpning skjer ikke i denne runden.

### A2. Claim-lock-vurdering av GAP-005-kandidatene (P0)

Fra `research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md`, kun de tre smale:

- **REKO-tall 2022** (siste sikre årsmelding-tall)
- **Andelslandbruk 93 gårder / 2023**
- **Rest AS konkurs 2024-09-05** (Brreg-bekreftet i R13-AKTOR-006)

Per kandidat: kjør PCQ per rad, skriv claim-lock-forslag (eksakt formulering + kilde +
caveat + `Ikke si`) til `research/_status/food-tg-r14/claim-lock-kandidater.md`.
Rutes gjennom `.claude/source-attribution-policy.md`; endelig claim-åpning er
menneskelig beslutning. Fiskeolje (delvis) tas kun hvis PCQ-passet A1 gir ny locator.

### A3. «Vent»-items — hent det som manglet (P1)

| Oppgave | Hva som skal hentes | Merk |
|---|---|---|
| A3.1 R13-PROT-006 | Nofima/FHF ressursregnskap 2022/2023 (nyere enn 2020-tallet) | Finnes det ikke: dokumenter fraværet som Type-C, ikke fremskriv |
| A3.2 R13-AKTOR-006 | Aksjonærdata via åpne kilder (Brreg aksjonærregister-uttrekk der mulig); dsm-firmenich årsrapport for Vestkorn | Betalingsmur (Proff Forvalt) noteres som C, kjøpes ikke |
| A3.3 R13-OKO-003 | NIBIO jordsmonnskart som proxy-baseline med eksplisitt caveat (61 % dekning) | JordVAAK-data finnes tidligst ~2029 — ikke vent på det |
| A3.4 R13-WASTE-005 / PROT-007 | Formuler aktørspørsmålene (Biogass Norge/NIBIO; NIBIO protein-gram-serie) som ferdige spørsmålspakker | Kun forberedelse — sending er bak G1 (→ spor D) |

Output: oppdaterte funn-notater i `research/external/r14/` + decision-rad per oppgave.

### A4. Datagap-atlas-vedlikehold (løpende)

Alle nye Type-C-hull fra spor A–C føres inn i
`docs/project/mandates/R13-LAND-004-datagap-atlas.md`. Spesielt: de usikre
universanslagene fra dekningsboka (gårdsutsalg, markedshager, jordhelse-karbon,
skogshage-agroforestry, demonstrasjonssteder) føres som linjeposter der — ingen egen
universrunde (vedtak §8.4 i gjenstående-statusen). I dashboardet: merk `lav`-nevnere og
vis «kartlagt antall + univers usikkert» i stedet for dekning-% der nevneren er myk.

---

## Spor B — Aktiverte VK-4/VK-5-datarunder (alle 5, i prioritetsrekkefølge)

Aktivert av Gabriel 2026-07-03. DB-skriving kun via etablerte importskript + `db:audit`.

### B1. Styredata-dekning for 13 konserntrær (VK-4 prioritet 1)

Styredata dekker i dag 98 av 275 selskaper i konserntrærne. Hent styresammensetning fra
Brreg roller-API (`data.brreg.no/enhetsregisteret/api/enheter/{orgNr}/roller` eller
rolleuttrekk) for de resterende selskapene, prioritert: NorgesGruppen-treet → Coop →
Reitan → Orkla → Mowi → øvrige nordiske. Import via etablert løype; kilde per rad =
Brreg-lokator med registerdato. Etter import: `npm run db:audit` + oppdater
`data/vault-export/board-members.json`-kjeden via `npm run vault:sync && npm run vault:check`.

### B2. Brreg-refresh for aldri-refreshede konsern (VK-4 prioritet 2)

- Identifiser konsern-noder uten refresh-dato siden første import; re-hent Brreg-snapshot.
- **Konkret P0-rad:** Orkla-canvasens «0 %»-kant mot Lilleborg AS
  (`0 Kart/Konsern/Orkla ASA.canvas`, notert i VK-5 §3) — kildesjekk eierandelen mot
  Brreg/årsrapport; rett kanten eller dokumenter hvorfor 0 % står.
- Avvik mellom snapshot og DB føres som funn, ikke autokorrigeres uten kilde.

### B3. M&A-events for NG-treet (VK-4 prioritet 3)

Desk-søk i Brreg-kunngjøringer + årsrapporter for fusjoner/oppkjøp/avviklinger i
NorgesGruppen-treet siden siste import. Konsernreviewen viste ingen akutte hull — dette
er en verifikasjonsrunde, ikke en jaktrunde. Funn med A-lokator kan importeres; alt annet
til datagap-atlaset.

### B4. Stakeholder-utfylling fra skeletons (VK-4 prioritet 4)

Fyll stakeholder-skeleton-noder med data fra allerede-innhentede kilder (R13-aktørkart,
`research/external/r13/R13-INNO-006-fou-aktorer.md`, aktørregisteret). KUN desk-kilder;
ingen kontakt. Noder uten kilde forblir skeleton med eksplisitt markering. Vurderes mot
I26-innsikten («gaps som krever menneskelig input») — det som krever samtale, rutes til spor D.

### B5. Norske sirkularitets-gaps ↔ VK4-GAP-missions (VK-4 prioritet 5)

Koble de 12 gap-nodene i `Food Systems Obsidian/10 Innsiktskart/Gaps/` mot eksisterende
R13-leveranser, og lukk desk-delene:

| Mission | Dekkes helt/delvis av | Gjenstående desk-arbeid |
|---|---|---|
| VK4-GAP-002 fiskeavfall | R13-WASTE-001 | Oppdater gap-noden med R-stige-tall + PCQ-status fra A1.2 |
| VK4-GAP-003 Matsentralen | R13-WASTE-003 | Kapasitetsgap-baseline inn i gap-noden; barrierer (logistikk/finansiering/regelverk) |
| VK4-GAP-006 oppdrettsslam | R13-WASTE-002 (parkert) | TRL-notat for teknologier; massebalanse forblir parkert til aktørdata |
| VK4-GAP-011 N/P/K oppdrett | R13-WASTE-002 | Utslippsbaseline (modellert 2019-tall) med eksplisitt «modellert ≠ målt» |
| VK4-GAP-012 N/P/K forbrenning | R13-WASTE-005/-007 | Volum + systemgrense; SE SPCR 120 som nordisk referanse |
| VK4-GAP-001 biogass NO/DK | delvis R13-WASTE-005 | Ny desk-oppgave: dansk kapasitet (Energistyrelsen) vs norsk (Miljødirektoratet) |
| VK4-GAP-004 mikroplast biorest | — | Ny desk-oppgave: Mattilsynet/gjødselvareforskrift + forskningskilder |
| VK4-GAP-005 AX-ekvivalent | R13-GAP-004/R13-PROT-* | Aktørkart-kandidater; kontakt/ask-felt er bak G1 |
| VK4-GAP-007 næringsstoff-gap 25–30 % | — | Claim-lock-notat: kan påstanden støttes eller må den nedgraderes? (P0) |
| VK4-GAP-008/-009 svartvann P/N | — | Ny desk-oppgave: Norsk Vann/SSB-baseline for fosfor/nitrogen-gjenvinning |
| VK4-GAP-010 husdyrgjødsel-N | — | Ny desk-oppgave: NIBIO/Miljødirektoratet tapsbaseline + tiltakseffekt |

Hver mission-lukking skrives som kildenotat i `research/external/r14/` og gap-noden
oppdateres med `siterbarhet: intern` + gate-status. Ekstern figurbruk av Sirkularitet-/
Norden-canvas forblir parkert bak claim-lock (VK-5 §7).

---

## Spor C — MVK-datainnhenting (vedtatt sekvens)

### C1. Handel-dagligvare wire-in (rask seier, først)

Cellen står 0/40, men konserndataen finnes. Map eksisterende dagligvarekonsern-/
eierskapsdata inn i MVK handel-dagligvare-cellene (dagligvarekjede,
spesialhandel-delikatesse, direktesalg-plattform). Gjenbruk companyId-lenking-mønsteret
fra grossist-leddet. Etter import: regenerer dashboard (`compute-metrics:full`-løypa) og
commit `public/data/coverage/profiles.json` + `data/konsern-coverage.json`.

### C2. Foredling-industri (hovedløftet, 0/140)

Brreg NACE-basert kartlegging etter samme kvalitetsfilter som havbruk/villfisk-rundene
(aktiv, AS/SA/ANS/DA, ikke ren holding). Rekkefølge etter konsentrasjonsvekt:
**meieri → kjøtt/egg → korn/mølle/bakeri → frukt/grønt-foredling → drikke/bryggeri →
sjømat-foredling → næringsmiddel-øvrig** (7 underdomener à ~20). Per underdomene:
node-kandidat-CSV + mottakslogg + usikkerhetslogg i `research/_status/` (samme mønster
som `mvk-*-2026-06-2x`-filene), import, `db:audit`, dashboard-oppdatering.

### C3. Etterkontroll-køen (22 flaggede noder)

Fra `research/_status/mvk-review-koe-2026-06-27.csv` (flagg-for-menneske = ja):
havbruk-akvakultur 3, villfisk-fiskeri 1, grossist-distributor 18. Per node: avgjør om
Brreg-aktiviteten faktisk er operativ rolle (behold) eller holding-/støtterolle
(reklassifiser/dropp). Kjør `audit:aquaculture(-reconcile)`-løypa og skriv
resolusjonsnotat (mønster: `mvk-review-koe-resolusjon-2026-06-26.md`).

### C4. Brreg financials + companyId-lenking

- Kjør `import-brreg-financials.ts` bredt for konsern/datterselskap uten regnskapstall
  (prioriter selskapene i de 13 konserntrærne — synergi med B1).
- Fortsett companyId-lenking av aktørnoder til selskaps-IDer (startet på grossist-leddet).

### C5. Primærproduksjon-resten (etter C1–C4, hvis kapasitet)

jordbruk-grønt, husdyr-beite, ville-ressurser-sanking, urban-dyrking (4 × 0/20). Samme
metode som C2. Kan skyves til R15 uten at noe annet blokkerer.

---

## Spor D — Actor-gate-forberedelse (bak G1 — KUN kandidatlister + source-shortlist)

Vedtak §8.5: forbered opp til actor-gate-linja, ikke gjennom den. Ingen PCQ på aktørdata,
ingen outreach, ingen intervjuer. Output per mål: kandidatliste-CSV + source-shortlist
per node, merket «klar til PCQ ved scope-vedtak», i `research/_status/food-tg-r14/actor-gate/`.

| Mål | Utgangspunkt (finnes allerede) |
|---|---|
| D1 R13-AKTOR-001 markedshager | `research/_status/R12-ACTOR-001-markedshager-og-smaaskala-gront.md` + `research/_status/R13-AKTOR-001-markedshager-verifisert.md` |
| D2 R13-AKTOR-002 andelslandbruk aktiv-status | `research/_status/R13-AKTOR-002-andelslandbruk-aktiv-status.md` + domene-node-kandidater 2026-06-25 |
| D3 R13-AKTOR-004 regenerative praktikere | `research/_status/R13-AKTOR-004-regenerative-praktikere.md` |
| D4 R13-AKTOR-005 frø/genressurs-nettverk | `research/external/r13/R13-AKTOR-005-fronettverk-genressurs.md` |
| D5 R13-AKTOR-007 skogshage/permakultur-sites | `research/_status/R13-AKTOR-007-skogshage-permakultur-sites.md` |
| D6 Aktørspørsmålspakker | Fra A3.4: Biogass Norge/NIBIO (WASTE-005), NIBIO protein-gram (PROT-007), fôr-grade tonn per aktør (GAP-004/006), oppdrettsslam 3-kolonners massebalanse (WASTE-002) |

Merk: Research Missions 1A–1D (intervjuer), Mission 2–3 (partner-validering, workshops)
i `research/RESEARCH-MISSIONS.md` er **menneskeoppgaver** — de står i planen kun som
avhengighet, Codex rører dem ikke.

---

## Spor E — Modell- og claim-lock-runder (internt)

### E1. I27+-parkerte innsikter — datarunder som kan åpne dem

De seks parkerte fra I27-porten (`obsidian-i27-kandidatgodkjenning-2026-07-02.md`)
mappes til arbeid i denne runden; generér INGEN I-noter uten ny beslutningsrunde:

| Parkert | Blir mulig etter |
|---|---|
| I28 (BAMA/ASKO) | A2/claim-lock-runde på aktørspesifikke formuleringer |
| I29 (nodekonsentrasjon) | B1 styredata + kilde-/metodepakke |
| I30 (tilskuddskonsentrasjon) | Egen støtte-/bonde-/distriktsrunde (ikke i R14 — noter i atlas) |
| I32 (havbruksmaktakse) | Egen havbruksrunde: C3-etterkontroll + B1-styredata for havbruksselskaper |
| I33 (pris-asymmetri) | Native prisserie — Type C inntil videre; noter i atlas |
| I35 (soya/EUDR) | A1.1 + A3.1 (fôr/import-kildegrunnlag) |

### E2. M6 konverteringsevne-scoring (PCQ per case)

Bygg på `R13-INNO-004-failure-survival-ledger.md` og `R13-INNO-005-konverteringsbarrierer.md`:
score per case (skalerte vs «ble i laben») med kilde per celle. Internt; ingen rangering
eksternt (46 av 50 R13-funn har «må ikke visualiseres ennå»).

### E3. M3 true-cost + M7 Nexus (kun metodearbeid, bak G3)

Metodenotat: skyggepris-tilnærming, datakrav, valideringsplan (Edinburgh/NMBU-forankring).
M7: verifiser Nexus-rapportens kilde og koble anbefalinger mot 5 domener som
source-shortlist. Ingen tall brukes eksternt før G3.

---

## Kjørerekkefølge og batcher

P0 først; DB-berørende batcher kjøres sekvensielt (ikke parallelt mot samme tabeller);
desk-batcher kan parallelliseres.

| Batch | Oppgaver | Type |
|---|---|---|
| 01 | A1.1–A1.7 (PCQ-pass) | Desk, parallell |
| 02 | A2 (claim-lock-kandidater) + VK4-GAP-007 (P0 claim-lock-notat) | Desk |
| 03 | C1 (handel-dagligvare wire-in) + C3 (etterkontroll-kø) | DB, sekvensiell |
| 04 | B1 (styredata, del 1: NG + Coop + Reitan) | DB |
| 05 | B1 (del 2: Orkla + Mowi + nordiske) + B2 (Brreg-refresh + Lilleborg-kanten) | DB |
| 06 | C2 (foredling-industri: meieri + kjøtt/egg) | DB |
| 07 | C2 (korn/mølle/bakeri + frukt/grønt + drikke/bryggeri) | DB |
| 08 | C2 (sjømat-foredling + næringsmiddel-øvrig) + C4 (financials + companyId) | DB |
| 09 | A3.1–A3.4 (vent-items) + B3 (M&A NG-treet) | Desk |
| 10 | B5 (VK4-GAP-missions: nye desk-oppgaver 001/004/008/009/010) | Desk, parallell |
| 11 | B4 (stakeholder-utfylling) + D1–D6 (actor-gate-prep) | Desk, parallell |
| 12 | E1-mapping + E2 (konverteringsscoring) + E3 (metodenotater) | Desk |
| 13 | A4 (atlas-konsolidering) + dashboard-regenerering + sluttrapport | Konsolidering |

C5 (primærproduksjon-resten) tas kun hvis batch 01–13 er grønne og kapasitet gjenstår.

## Output-kontrakt

1. **Desk-artefakter** → `research/external/r14/` (universal-format: Kort dom, Sterkeste
   kilde, Svakeste punkt, Funn-tabell m/klasse+caveat, Tomme celler, `Ikke si`, Anbefalt gate).
2. **PCQ-notater** → `research/_status/food-tg-r14/pcq/`.
3. **Decision JSONL** → `research/_status/food-tg-r14/decisions/batch-NN.jsonl`
   (samme skjema som R13 goal-codex).
4. **Batch-rapporter** → `research/_status/food-tg-r14/report-batch-NN.md`
   (mottaksprotokoll §3-format).
5. **Intake-indeks** → `research/_status/food-tg-r14/r14-intake-index-2026-07-03.md`
   (opprettes fra R13-malen; Kontrollstatus + Hurtigoppsummering per batch).
6. **MVK-artefakter** → node-kandidat-CSV + mottakslogg + usikkerhetslogg per underdomene
   i `research/_status/` (etablert `mvk-*`-navnemønster).
7. **Vault-oppdateringer** (B1/B2/B5-gap-noder) → gjennom `npm run vault:sync && npm run vault:check`.

## Definition of done

- Alle batch 01–13-oppgaver har output-artefakt + decision-rad + intake-rad.
- A1: alle 7 PCQ-notater med beslutning per rad; A2: claim-lock-forslagsdokument finnes.
- B1: styredata-dekning rapportert som ny X/275-telling; B2: Lilleborg-kanten løst
  (rettet eller dokumentert); B5: alle 12 VK4-GAP-noder har oppdatert status eller nytt kildenotat.
- C1: handel-dagligvare > 0 i dashboardet; C2: minst meieri + kjøtt/egg mettet (~20/20);
  C3: 0 uløste flagg i review-køen (resolusjonsnotat finnes).
- D: 5 kandidatlister + spørsmålspakker merket «klar til PCQ ved scope-vedtak»; ingen aktørkontakt gjort.
- Ingen output åpner claim, bruker `safe_for_ai_context` eller whitepaper-stemme.
- Kontroller kjørt og grønne:

```bash
# Etter hver DB-batch
npm run db:audit

# Etter vault-berørende batcher (B1/B2/B5)
npm run vault:sync && npm run vault:check

# Etter dashboard-berørende batcher (C1/C2/C4)
npm run compute-metrics:full   # + commit profiles.json / konsern-coverage.json

# Sluttkontroll
npm run test && npm run lint && npm run build
npm run audit:citable
npm run audit:research-artifacts -- --base=origin/main
git diff --check
```

## Stop / eskaler til menneske

Stopp og rapporter i stedet for å gjette når:

- en oppgave krever aktørkontakt, lukket data eller scope-vedtak (G1) — registrer kravet i spor D
- to primærkilder gir motstridende tall uten metode for å avgjøre — før til datagap-atlaset
- en claim-lock-formulering (A2, VK4-GAP-007) er klar — **stopp**: claim-åpning er Gabriels beslutning
- Brreg-refresh (B2) viser eierskapsavvik > registerdato-forklaring — funn, ikke autokorreksjon
- `db:audit` eller strict-gates blir røde etter import — rull tilbake batchen og rapporter
- I27+-parkerte innsikter frister til generering — ingen I-noter uten ny beslutningsrunde
