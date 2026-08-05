# RAPPORT — Totalgjennomgang av Food Systems 2026

**Dato:** 2026-08-05
**Omfang:** Prosjektstatus, database, kunnskapsgrunnlag, verdikjededekning, plan for videre prosesser
**Metode:** Fire parallelle revisjoner (prosjektstatus / database / kunnskapsgrunnlag / verdikjededekning), med live database-verifisering og gjennomgang av NATTSESJON-2026-08-04, masterhjerne, INNSIKT-SPOR, vault og research/.

---

## 1. Hoveddom

Prosjektets egen formulering fra masterhjernen (2026-07-21) holder fortsatt:

> **«Komplett bredde, håndhevet ærlighet, tynn dybde, ingen tid, ingen stemmer.»**

- **Skelettet er under kontroll** — strukturdata (selskaper, eierskap, styrer, subsidier, produsenter, leveranser) er reelt, sitatkoblet og live-verifisert så sent som 04.08.
- **Kjøttet mangler** — volum, aktivitet, materialstrømmer og menneskelige stemmer. Kun 2 av 73 dekningsceller har «høy» konfidens; 0 av 1 555 registrerte kilder er analysert inn i den kanoniske kunnskapsbasen; 0 intervjuer er gjennomført.
- **Disiplinen er prosjektets styrke** — INNSIKT-SPOR runde 2 (05.08) strøk 93 tall som bare hvilte på intern syntese. Det er sjeldent og riktig, men betyr at deler av det interne faktagrunnlaget nå er tynnere enn det så ut.

---

## 2. Prosjektstatus og nylig arbeid

### 2.1 Mål og fase
Mål (fra MASTERPLAN-2026-07-06 og PROJECT-OVERVIEW): et «levende, spørrbart, selvoppdaterende nordisk matsystem-observatorium» — verifiserbar kunnskapsmaskin der hver påstand bærer primærkilde og proveniens (fail-closed, claim-lock, PCQ-gates). Bygget på kontrakt P25013 (WP3 Nordic Circular Food Systems) for Natural State / Food Systems Transition Group.

Kontraktsperioden løp ut **31.07.2026** (M16 roadmap, M17 publisering + offentlig event, M18 videreføringsplan). **Ingen fil bekrefter utfallet av M17-eventet eller M18-vedtaket** — statusdokumentene er foreldet på det viktigste punktet.

### 2.2 Masterhjerne (2026-07-21)
Full filcensus (4 326 filer, 717 MB) mot masterplanens målbilde. Modenhetstall: hukommelse 85, samvittighet 92, sanser 8, tidssans 5, forestillingsevne 22, stemme 30. 1 634/1 651 aktørregistreringer kartlagt (99 %), men 59 av 70 dekningsceller «lav» konfidens. 244 516 feltsiteringer, 0 intervjusitater. QA-rapporten 03.08: *«grønt som lokal, teknisk kunnskapsinfrastruktur, men rødt som ferdig nordisk kunnskapsbase — 0 av 1 555 kilder er analysert»*.

### 2.3 Nattsesjonen 2026-08-04
Gjennomstrømningsfokus: 511 av 538 primærkilder lest (433 fullt, 73 delvis, 5 uleselige). Resultater:
- **AP-1 FULLFØRT** — lockfix (`733ad96`), kontrollpakke grønn (282/282 tester).
- **AP-2 FULLFØRT** — gren pushet som backup (38 commits); offentlig sporet PEM-nøkkel avgrenset før push.
- **AP-6 DELVIS** — 420 MB QA-transfer-tmp slettet; stoppet korrekt ved levende worktree.
- **AP-7 DELVIS** — live DB-verifisering read-only: DB har ikke flyttet seg siden 03.08 (ControlledMutationAudit=0); låst plan stoppet fail-closed på stale manifest-pinne.
- **AP-8 FULLFØRT** — 511/511 kilder lest, én provisorisk triage-post per kilde.
- **AP-9 FULLFØRT** — dekningsmatrise over alle 11 DATAGAP-felt, topp-50 kildeprioritering, **288 maskinrollefeil** avdekket, 4 duplikatpar, Nord-aliaser feilidentifisert.
- **AP-10 DELVIS** — locatorjakt for 29 kilder + rolleforslag for 123 ukjente.
- **Parkert:** AP-3 (Unicode-stiduplikater), AP-4 (foldet inn i AP-9), **AP-5 (pålitelig startmekanisme for source_registration_apply — «bør plukkes opp først»)**.

### 2.4 Innsiktsspor runde 2 (2026-08-05, commit `9938c59`)
8 underagenter leste 118-kilders kjernekorpus, omskrev alle 11 ANALYSE-filer, strøk **93 runde-1-tall** som bare hvilte på intern syntese. Tre felt bekreftet tynne på evidensnivå: alternativt protein, økologi/jordhelse, kvalitativt lag.

### 2.5 Organisatoriske risikoer
- **To parallelle arbeidslinjer:** kunnskapslinjen på umerget `nordic-knowledge-canonical-v1` (38 commits foran main), mens Innsiktsspor-runde-2 ble committet på `codex/visual-system-atlas-v1`. Hovedutsjekket har **364 ukommitterte filer** (~11 885 +/-3 210 linjer sporede endringer + 225 nye filer).
- **~1 555 eierbeslutninger venter:** rolleklassifiseringer, 288 rollekorreksjoner, duplikatmistanker og locatorforslag er provisoriske — ingenting skrevet til register/kø/DB. `--apply` karantenert til AP-5 løses.
- **Splittet source of truth:** strukturdata → Prisma-DB → vault-export → Maktkart (korrekt enveis); kvalitative claims → INNSIKT-SPOR runde 2 er nyest og strengest, men vaultens Innsiktskart/Gaps bærer fortsatt strøkne tall — **vaulten ligger én revisjon bak**. Møter/transkripter lagret tre steder.
- Masterplan vs. masterhjerne-tall divergerer (217 fail-closed-blokkerte vs «0 blocked_unsourced»; 244 516 vs 517 feltsiteringer).
- Menneskegatet uavklart: Mission 1-intervjuer (0 gjennomført), Mission 2 nordisk validering (ikke sendt), personvern-/publiseringspolicy (blokkerer offentlig flate), NordForsk-søknad (frist 02.12.2026).

---

## 3. Database — tilstand og kvalitet

Postgres 16 (`pg_trgm` + `pgvector`), ~40 modeller, 31 migrasjoner (apr–jul 2026), null schema-drift utover dokumentert FTS-avvik. Live-tall verifisert direkte 05.08 (samsvarer med AP-7, 04.08):

### 3.1 Sterkt lag (stol på det)
| Modell | Rader | Merknad |
|---|---:|---|
| `Subsidy` | 179 311 | 2022–2025, Landbruksdirektoratet, 0 foreldreløse |
| `DeliveryVolume` | 60 310 | **kun 2024**, 14 varer |
| `Producer` | 55 371 | alle NO |
| `Company` | 351 | NO 289, SE 23, DK 16, FI 14, IS 8, NL 1 |
| `CompanyOwnership` | 160 | konserntrær score 9–10 for majors |
| `FieldCitation` | 244 516 | proveniens overalt, fail-closed mutasjonskontroll |
| `Document` | 1 539 | FTS OK; **embeddings 0/1 539 (pgvector ubrukt)** |

Konsern med qualityScore 10/10: Orkla (14 selskaper), Nortura (12), Tine (5), BAMA, ASKO (16), Felleskjøpet, NorgesGruppen (49 selskaper, 46 med ferskt regnskap).

### 3.2 Svakt lag (behandle som uverifisert)
- `BoardMember`: **1 800 av 1 800 verificationStatus = NULL**
- `Shareholder`: 62 NULL + 20 unverified — **0 verifiserte**
- `CompanyFinancial`: 406 årsrader; 233 NULL, **98 av 351 selskaper helt uten regnskap**
- `BusinessRelationship`: alle 105 NULL
- `SourceCitation` (2 794): 1 465 `needs_review` (52 %), 46 `failed`, 1 `disputed`, 12 `blocked_unsourced`
- **Tomme tabeller:** `EvidenceAppraisal` (0), `FishHealthObservation` (0) — schema foran data
- Mediedomene: 8 outlets / 10 entries / 10 codings — symbolsk
- Rekonsiliering (14.06): 3 selskaper tapt ved import (org.nr 987565922, 948202063, 949556207)
- Konserndekning (03.07): M&A-events nesten fraværende; **18 foreldreløse røtter** (Kavli Holding, ICA Gruppen, SOK, Kesko, Hagar, Festi, Kverva, Laco, Compass Group Norge, ISS, REITAN AS m.fl.)

### 3.3 QA-verktøy
~50 verifiseringsskript (`verify-data-integrity.ts`, `audit-konsern-coverage.ts`, `validate-against-brreg.ts`, sitat-hash/url-health m.fl.), koblet i `package.json` og ukentlig CI-workflow (søndag 03:00 mot prod via CF-tunnel — **uklart om cron faktisk er skrudd på**: `CITATION_VERIFY_ENABLED` og uavkrysset sjekkliste). Verktøyene måler gapene oftere enn de lukker dem; dekningsartefakter (`konsern-coverage.json`, vault-export) er ~1 måned gamle.

**Vurdering:** Databasen er et brukbart fundament. Stol på register-/volumdata og konserntrær med score ≥9; behandle styrer/aksjonærer og `needs_review`-sitater som uverifisert inntil videre.

---

## 4. Kunnskapsgrunnlag — organisering, dybde, bredde

### 4.1 Vaulten (`Food Systems Obsidian/`, 786 notater)
| Notater | Mappe | Vurdering |
|---:|---|---|
| 540 | `11 Maktkart/` | DB-genererte aktørnoder; kjernenotater substansielle, 315 register-notater bevisst tynne. Duplikater: Dagrofa ×3, REMA 1000 ×4 |
| 128 | `10 Innsiktskart/` | Reell faglig kjernekuratering (I01–I26, Looper, Gaps) — **men bærer fortsatt tall INNSIKT-SPOR runde 2 strøk** |
| 47 | `12 Kilder/` | 10 kildenotater + 18 møter + 19 transkripter — **dekker ~2 % av 511-kilders korpuset** |
| 21 | `1 Oversikt og navigasjon/` | HUB-er, Kunnskapsstatus (ærleg og presis) |
| 3 | `5 Produsenter og støtte/` | Nær-tom |

Frontmatter-disiplin sterk (alle 786 har `type` + `siterbarhet`), men **alle er `siterbarhet: intern`, 742/786 `status: generert`** — kun 22 kuratert. Siterbarhetsgaten har aldri sluppet noe gjennom.

### 4.2 `research/` (~1 900 filer)
Aktiv kunnskap: `bibliotek/` (484), `evidence-pack/` (417), `analyse/` (41), `norden/` (56), `rammeverk/` (25). Ny inntaksbølge: `innhenting-2026-08-05/` (236 filer, batch B0–B7). Styring: `_status/` (629, størst). Arkiv: `arkiv-sortert/` (311, klart merket). Duplisering: ~50 `external-*.md` ligger både flatt på rota og i `research/external/`.

### 4.3 INNSIKT-SPOR (27 filer) — det skarpeste analytiske laget
11 feltanalyser (aktordybde, alternativt_protein, beredskap_import, kausalitet, kvalitativt_lag, lokale_verdikjeder, makt_eierskap, materialstrommer, nordisk_dybde, offentlig_innkjop, okologi_jordhelse). Høy dybde, usædvanlig evidensdisiplin: hvert tall bærer kilde, lokator og `basis`-klassifikasjon. Merket «provisorisk — internt, ikke publiserbart».

### 4.4 Dybde/bredde per tema (kvalitativt)
- **Sterkt:** dagligvare (ledd 5), makt/eierskap, nordisk dagligvare-sammenligning
- **Middels:** beredskap/selvforsyning, matsvinn/sirkularitet, nordisk policy
- **Tynt:** primærproduksjon, lokale verdikjeder, horeca, forbruker, fysiske materialstrømmer, kausalitet, menneskelig erfaring

---

## 5. Verdikjededekning — matrise

| Segment | Dekning | Nøkkelevidens |
|---|---|---|
| Dagligvarehandel | **Sterk** | Alle 4 nordiske markeder primærforankret: NO NG 43,5 % / Coop 29,1 % / Rema ~23,9 % (227 mrd. kr); SE ICA >50 %; FI S 48,3 %/K 34,3 %; DK Salling 32 %. Gebyr ~4,93 mrd. kr (påklaget) |
| Eierskap/finans/styrer | Sterk for norske majors | 12 konsern m/ kontrollerende eier (Johannson 74,4 %, Reitan 100 %, Witzøe 41,3 % m.fl.); men 18 orphanRoots, M&A ≈ 0, styredata uverifisert |
| Foredling | Sterk for majors, middels for segmentet | Tine/Nortura/Orkla/BAMA 10/10; segmentandeler strøket som syntese; CR3 >80 % (NOU 2013:6) |
| Subsidier/politikk | Middels–sterk | 179k subsidierader, virkemiddel-policy kartlagt; virkningseffekt ukjent; PT-mikrodata ubrukt |
| Engros/logistikk | Middels | ASKO 10/10; 80 grossistaktører uten volum/kapasitet; per-node kapasitet Type C |
| Utenrikshandel/import | Middels | Hovedserier PCQ-kontrollert (soya 242,3 mill. kg tollmålt); ingen import/eksport-modell i schema; selvforsyningsgrad metodeavhengig |
| Beredskap/selvforsyning | Middels | Matkornmål 82 500 t kontraktsdekket; fysisk lagerkapasitet per node Type C/gradert |
| Innsatsindustri | Middels | FK 10/10; soya/kraftfôr-import delvis målt; fôrprotein-nevner mangler; maskineri ikke kartlagt |
| Primærproduksjon | Middels–svak | 55k produsenter registrert men «registre bekrefter eksistens, ikke aktivitet»; lang hale av enkeltprodusenter tom |
| Arbeidsliv/stemmer | **Svak** | 0 intervjusitater; sesongarbeid/vilkår tilnærmet fraværende (4 treff på 3 filer) |

### Største substanshull (bekreftet av INNSIKT-SPOR runde 2)
1. **Fysiske materialstrømmer** — realisert N/P/K-retur måles ingen steder i Norden; oppdrettsslam modellert→innsamlet→behandlet kobles ikke
2. **Norsk offentlig matinnkjøp** — null nasjonal statistikk i 118-kildekorpuset; fraværet er selv et styringsfunn
3. **Lokale verdikjeder** — REKO/Bondens/CSA nevnes ikke i én av 60 kjernekilder
4. **Jordhelse** — ingen nasjonal SOC-baseline (JordVAAK publiserer ikke baseline)
5. **Alternativt protein** — null realisert nordisk produksjonsvolum
6. **Kvalitativt lag** — 0 gjennomførte intervjuer
7. **Nordisk asymmetri** — alle 73 dekningsceller geo=NO; FI/IS 2025-finanser mangler

### Uutnyttede kilder (prosjektets egen liste, prioritert etter ROI)
- **Fiskeridirektoratets landings-/kvoteregister + biomasse** — åpent, ubrukt, gratis; løfter 270 sjømataktører fra «finnes» til «driver» (høyest ROI)
- **Skatteetatens aksjonærregister** — eier-/founder-lag; gratis via innsyn
- **Proff/Forvalt-abonnement** — ikke anskaffet; lav kostnad
- **Mattilsynets tilsynsdata** — aktivitetssignal for foredling/HORECA
- **Landbruksdirektoratet PT-mikrodata** — søknadsbasert
- **DFØ/KS/KOSTRA/Doffin** — offentlig innkjøp; innsynsrunde planlagt
- **Bolagsverket/Virk/PRH (SE/DK/FI)** — kan doble nordisk styre-/aktørdekning; pipelinen ferdig
- **SINTEF/FHF-primærrapporter** bak de 93 strøkne tallene
- **Matvett/bransjeavtalen 2025**, **NIBIO JordVAAK/NSCM**, **Nielsen/GfK** (kun ved finansiering)
- **Mission 1-intervjuer** — ferdig pakke, ikke utsendt

---

## 6. Plan for videre prosesser

### Fase 0 — Rydding (forutsetning for alt annet)
1. **Løs parkert AP-5** — pålitelig startmekanisme for `source_registration_apply`; lag ny signert plan (AP-7 viste at manifest-pinnen er stale).
2. **Gjennomgå nattsesjonens beslutningsunderlag** — 288 rollekorreksjoner, 4 duplikatpar, locatorforslag → signert apply.
3. **Commit/rydd de 364 ukommitterte filene**; avklar merge-strategi mellom `nordic-knowledge-canonical-v1` og `codex/visual-system-atlas-v1`.
4. **Propager INNSIKT-SPOR-strykningene** (`SYNTESE.md` §10) inn i vaultens Innsiktskart/Gaps — én synk, ikke gradvis drift.
5. **Skriv oppdatert statusdokument** som erstatter masterhjerne/masterplan-snapshots og bekrefter M17/M18-utfall.

### Fase 1 — Gratis dybde, høyest ROI (desk research, 2–4 uker)
6. **Fiskeridirektoratet** landinger/kvoter/biomasse — åpent, ubrukt; løfter 270 sjømataktører.
7. **Aktivitetssignaler fra åpne registre** — Mattilsynet-tilsyn, Brreg-regnskap som driftsproxy; retter vertikal skjevhet.
8. **Hent SINTEF/FHF-primærrapporter** bak de 93 strøkne tallene før gjeninnføring.
9. **Eier-/founder-laget** — Skatteetatens aksjonærregister + Proff/Forvalt-abonnement; lukk 18 orphanRoots; verifiser 1 800 styre- og 82 aksjonærrader.
10. **Nordisk replikering** — Bolagsverket/Virk/PRH for 3 verdikjedesteg; FI/IS 2025-finanser.

### Fase 2 — Aktørkontakt (start nå, ledetid 2–3 uker)
11. **Mission 1-intervjuer** — pakken er ferdig; eneste vei til førstepersonsdata; blokkerer hvitbok-kvalitet.
12. **Innsynsrunde** — DSB/Landbruksdir. (beredskapskapasitet), DFØ/KS/Doffin (offentlig innkjøp); avslag dokumenteres som C-funn.

### Fase 3 — Bruk hullene som funn
13. **C-hullene som policy-budskap** — «dette måler ingen i Norge» (offentlig innkjøp, N/P/K-retur, lagerkapasitet), dokumentert med ansvarlig institusjon, er et av de sterkeste bidragene til hvitboken.

---

## 7. Bunnlinje

Du har kontroll på verdikjedens **struktur**, ikke ennå på dens **virkelighet** — men prosjektet vet uvanlig presist hvilke celler som kan fylles gratis (Fase 1), hvilke som krever mennesker (Fase 2), og hvilke som er fravær av nasjonale måleregimer (Fase 3). Fase 0 må gjøres først: alt videre forutsetter én gren, én sannhet, og en fungerende signert apply-vei inn i korpusregisteret.
