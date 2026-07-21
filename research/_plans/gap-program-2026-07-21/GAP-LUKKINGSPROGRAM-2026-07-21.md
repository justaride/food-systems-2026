# Gap-lukkingsprogram — fra hull til lukket, sporbart og siterbart

**Dato:** 2026-07-21
**Status:** Operativt programutkast — intern styring. Ikke claim-locket. Ruter alle dokumenterte hull fra DATAGAP-ANALYSE-2026-07-06 og masterhjerne-statusen, men dokumenterer ikke at hullene er ferdig lukket.
**Eier-beslutninger som trengs:** merket **[BESLUTNING]** i teksten; samlet i §8.
**Følgesvenner (levert sammen med dette):** `data/nordisk-finanser-2025-kandidater.csv` + `-mottakslogg.md` · `funn/det-norge-ikke-maaler-2026-07.md` · `prosess/mission-1-intervjupakke.md` · `prosess/mission-2-nordisk-validering.md` · `innsyn/*` (4 brev + survey) · `prosess/appraisal-sprint-plan.md` · `prosess/t15-kausalitets-case-mal.md`

---

## 1. Premisset: hva «fylle alle hull» faktisk betyr

Prosjektets styrke er at det vet hva det ikke vet. Derfor kan ikke «fyll alle hull» bety «samle mer av alt» — det ville bryte metoderegimet. Et hull kan lukkes på nøyaktig tre ærlige måter, og programmet ruter hvert hull til én av dem:

- **LUKK (Type A):** kilden finnes åpent; hullet lukkes med desk research → kandidat-CSV → mottakslogg → review → import → audit. Kan gjøres nå.
- **PROSESS (Type B):** hullet krever menneskehandling (intervju, aktørkontakt, innsyn, betalt register). Kan ikke lukkes ved skrivebordet; programmet kan levere et *prosessutkast* (brev, guide, samtykke, pipeline) som først blir operativt etter eierbeslutning, utførelse og dokumentert utfall.
- **DOKUMENTÉR (Type C):** prosjektet har etter dokumentert søk og relevant institusjonsavklaring ikke identifisert en dekkende kilde. Hullet lukkes ikke — søkestatusen *dateres som kandidatfunn*, med ansvarlig institusjon og neste bekreftelse. Et absolutt «dette måler ingen i Norge» krever sterkere bevis enn at prosjektet ikke fant en åpen serie.

**Ufravikelig gjennom hele programmet:** ingen agent eller desk-runde skriver direkte til «sant»-tilstand. Alt går via mottakslogg → review-kø → menneskegate. Gatene består; det er tempoet og sporbarheten programmet forbedrer.

---

## 2. Hele hullbildet på ett brett — status og rute

De 16 innhentingsoppgavene fra DATAGAP + de tverrgående kvalitetshullene fra masterhjerne-statusen, hver rutet og med eier og neste artefakt.

| # | Hull | Type | Rute | Status nå | Neste artefakt | Eier |
|---|---|---|---|---|---|---|
| **T1** | Mission 1-intervjuer (5 stemmer) | B | PROSESS | Beslutningsklart utkast; ikke utsendingsklart/sendt | Eier-, personvern-, samtykke- og scopebeslutning → personalisering/review → eventuell sending | Gabriel |
| **T2** | Mission 2 nordisk partnervalidering | B | PROSESS | 4 SE- og 5 DK-rader fylt med primærkilde, scope og claim-grense; ikke partnerbekreftet/sendt | Scope-/mottakeravklaring → Cathrine-review → eventuell sending | Cathrine |
| **T3** | FI/IS 2025-finanser | A | SOURCE-GATED KANDIDAT | Validator: 16 rader = 15 tallceller + 1 åpen; 5 grupper krever modellvalg; Samkaup er `source_gap`; `canApply:false` | Kildereview + modellvalg → validator grønn → PCQ/dry-run | Gabriel |
| **T4** | «Det Norge ikke måler»-boks | A/C | DATERT KANDIDAT | 6 C/underveis-hull formulert; under claim-review | Kildereview → eksisterende whitepaper-kap. 11 | Cathrine |
| **T5** | Aktivitetssignal havbruk + villfisk (270 aktører) | A | LUKK (metode-/entity-gated) | Frosset prosjektutvalg: 120 havbruk + 150 villfisk; ingen kjørbar felles aktivitetsmetode | Actor→Company→register-ID-preflight; velg signal per domene | Gabriel |
| **T6** | Aksjonær-/founder-lag topp 50 | A/B | PROSESS+LUKK | Beslutningsklart innsynsutkast; ikke utsendingsklart/sendt | Avsender/signatur + scope + personvern + juridisk readback → review → eventuell sending | Gabriel |
| **T7** | REKO/CSA 2026-aktivitet | A→B | PROSESS | Beslutningsklart surveyutkast; personvern/samtykke/minstegrense åpne; ikke sendt | Årsmeldinger → lukk vern/terskel/scope → skjema-/kontaktreview → eventuell sending | Gabriel |
| **T8** | N/P/K-tabellskjelett (VK4-GAP-007) | A | LUKK (source-gated matrise) | Kilde-shortlist og cellekontrakt finnes; ingen Type A-celler er ferdig fylt | Primærkilde + lokator + PCQ, én strøm om gangen | Gabriel |
| **T9** | Alt-protein realisert volum topp 15 | A/B | PROSESS (metodevalg + actor-gate) | Ingen frosset topp-15, volumproxy-kontrakt eller kjørbar pipeline | Definer utvalg; direkte tonnasje eller dokumentert pris×produktandel; ellers C/actor-gated | Gabriel |
| **T10** | Innsyn: DSB/Landbruksdir./DFØ-KS | A/C | PROSESS | 3 beslutningsklare innsynsutkast; ikke utsendingsklare/sendt | Avsender/signatur + scope + juridisk readback → review → eventuell sending → tilgangslogg | Gabriel |
| **T11** | Nordisk MVK-replikering 3 steg × SE/DK | A/B | LUKK (H2 design) | Generisk importskjelett finnes; ingen operasjonell SE/DK-konfig, universe, legal-ID-regler, validator eller kandidatbatch | Frys 3×2 celler → tilgang/lisens → kandidat-only pilot én celle per land | — |
| **T12** | Nordisk styre-/eierskapsdekning 14→61 | A/B | LUKK (source/access-gated H2) | Read-only baseline: 14/61 selskaper med styredata; ingen nordisk innhentingsadapter eller dokumentert dekningsprognose | Frys 47 mangler; skill styre/eierskap; tilgangs- og personvernreview; pilot én adapter | — |
| **T13** | Subsektor-HHI som tidsserie | A/B | LUKK (H2 design) | Norsk dagligvare 2020–2024 + enkelte punktestimater; ingen harmonisert tidsserie for fôr, kjøtt, emballasje eller grossist | Definer marked/nevner/konsolidering → minst tre sammenlignbare år → pilot én subsektor | — |
| **T14** | Materialstrømlag v1 + sårbarhetsindeks; full N/P/K-balanse | A+modell | MODELL (H2/H3) | Legacy proxy + kildeshortlist; ingen full massebalanse eller validert nettverkssårbarhetsindeks | H2: celleledger + separat indeks-spec; full balanse beholdes i H3 | — |
| **T15** | Kausalitet: case-klasse m/evidensgradering | B/hyp. | PROSESS (H2) | Uvalidert metodeutkast; 0 operative case | Fyll ett pilotcase → navngitt metodereview → maskinlesbart skjema/validator | — |
| **T16** | Kanalfordeling lokalmat | B | PROSESS (parkert H2) | 938 mill. kr samlet direktesalg 2025; ingen offentlig kanalfordeling, taksonomi, denominator, kildeavtale eller budsjett | Beslutningsnotat for output/kilde/lisens/pris/partner; deretter eventuell kildeanskaffelse | — |
| **Q1** | Appraisal 0/417 (evidenskvalitet) | — | PROSESSUTKAST | Sprint-plan levert; produksjonsworkflow mangler; 3 piloter venter menneskereview | Fullfør pilot → design/review topp-50-workflow | Gabriel |
| **Q2** | Bibliotek-review-kø (89) + `approved_internal` (35) | — | PROSESS | 89 `review_required`: 24 mekanisk URL-reparasjon, 57 sammendragskuratering, 8 manuelt kildeoppslag; 0 menneskereviewet | Navngitt triage etter pilotgaten i Q1 | Gabriel |
| **Q3** | Tekstreparasjon | A | LUKK (kø) | Dry-run: URL-løpet foreslår 17 oppdateringer av 24 rader; lokal/PDF foreslår 0; ingen apply | Review 17-raders plan → kontrollert apply med kvittering | Gabriel |
| **Q4** | Varig kildearkiv | A | LUKK (kø) | Live audit: 521/2 376 eksternt klare/med-note har varig kopi; 1 855 trenger arkiv; gate feiler med 1 872 blokkerende ID-er | Dedupliser/prioriter → arkiv-dry-run → kontrollert apply | Gabriel |
| **Q5** | Backlog-status-synk (50 «planned») | — | HYGIENE | Statusregler ikke avstemt; ingen deterministisk diff eller synk kjørt | Avstem kontrollnotater → dry-run-diff → review → eventuell CSV-skriv | Gabriel |
| **Q6** | Interne konsistensavvik (§10 i status) | — | HYGIENE + DESTRUKTIV GATE | Live tall propagert; 18 identitetsavvik og katalogvintage gjenstår; matsvinnloven-apply deaktivert | Ikke-destruktiv katalogrydding separat; identitetsapply krever backup/restore/hasher/autoritet | Gabriel |

**Lesning av tabellen:** 0 nye hull er ferdig lukket i denne runden. T3 og T4 er to kandidater/datert-under-review, ikke ferdige funn. Seks gap-ID-er har prosessutkast (T1, T2, T6, T7, T10 og Q1); de fire innsynsbrevene er fire dokumentkomponenter, ikke fire ekstra lukkede gap. De resterende 14 gapene står i kø, hygiene eller H2. Alle 22 har en foreslått disposisjon, men disposisjon er ikke det samme som fullføring.

---

## 3. Rekkefølge — de fire bølgene

Prioritering = (verdi for whitepaper/roadmap) × (lukkbarhet) ÷ (kostnad), rammet inn av kontraktsklokken (31. juli).

### Bølge 0 — denne uken (før 31. juli), whitepaper-kritisk
Alt her har et utkast eller en tydelig neste handling, men ingenting skal omtales som ferdig før den relevante review-, import- og menneskegaten er passert:
1. **T1/T2 besluttes og ferdigstilles internt** — pakkene er beslutningsklare, ikke utsendingsklare. Lukk eier/personvern/samtykke/scope og personaliser Mission 1. Mission 2 har nå 4 SE- og 5 DK-rader uten åpne dataplassholdere, men mottakere, partnerscope og Cathrine-review gjenstår. Eventuell ekstern sending er et eget steg etter eksplisitt godkjenning. Utkast: `prosess/mission-1-*`, `prosess/mission-2-*`.
2. **T3 klargjøres for mulig import** — `npm run validate:fi-is-financial-candidates` bekrefter 16 rader = 15 tallceller + 1 åpen Samkaup-rad, men klassifiserer fem tallbærende aktørgrupper som `model_decision_required`, Samkaup som `source_gap` og samlet `canApply:false`. Kildereview og modellvalg må lukkes før PCQ, ny validering, dry-run og eventuell import.
3. **T4 gjennom review før whitepaper** — «Det Norge ikke måler»-boksen (`funn/`) gjennom kilde- og claim-review før den eventuelt oppdaterer eksisterende V2 kap. 11.
4. **T10/T6 innsyn ferdigstilles internt** — utkastene mangler avsender/signatur, endelig scope og juridisk readback. Fyll og review dem før eventuell ekstern sending, som krever eksplisitt godkjenning. Et avslag skal logges som et tilgangsutfall og reviewes; det beviser ikke i seg selv at en nasjonal dataserie ikke finnes.

### Bølge 1 — Horisont 1 (aug–des), metode- og konfidensarbeid
T5 (aktivitetssignal for et frosset 270-raders prosjektutvalg), T8 (N/P/K-cellekontrakt og primærkilder), T9 (alt-proteinvolum), T6/T7-oppfølging og Q1–Q4-kvalitetsløp. Readback viser at dette er en blanding av metodevalg, entity resolution, kildelukking, menneskereview og kontrollert kjøring — ikke en ferdig batch.

### Bølge 2 — Horisont 2 (2027), nye lag
T11–T16 er H2/H3-design, ikke kjørbare batcher:

- **T11:** generisk importskjelett kan gjenbrukes, men SE/DK-univers, legal-ID-regler, tilgang/lisens, validator og kandidatbatch mangler.
- **T12:** read-only baseline viser 14/61 selskaper med styredata. Styre- og eierskaps-KPI må skilles; nordiske kildeadaptere og dokumentert dekningsprognose mangler.
- **T13:** norsk dagligvare har en 2020–2024-serie, men ingen av de fire målsubsektorene har harmonisert tidsserie. Start med marked/nevner/aktørkonsolidering og én pilotserie.
- **T14:** bygg materialstrømlag v1 og en separat, reviewbar indeks-spec i H2. «Full N/P/K-balanse» forblir H3 med mindre roadmapet vedtas endret.
- **T15:** malen er et uvalidert metodeutkast med 0 case. Neste artefakt er ett utfylt, navngitt reviewet pilotcase og deretter skjema/validator.
- **T16:** samlet direktesalg er kjent, kanalfordelingen er ikke. Oppgaven står parkert bak kanaldefinisjon, nasjonal nevner, kilde/lisens, budsjett og partneransvar.

For alle seks gjelder: «ikke funnet i desk research» blir ikke Type C uten dokumentert søk og relevant institusjonsavklaring.

### Løpende — hygiene og rytme (§7)
Q5/Q6 + de rituelle syklusene som gjør at hull ikke gjenoppstår.

---

## 4. Bølge 0 i detalj — det som lukkes/utløses nå

### T3 · FI/IS 2025-finanser — SOURCE-GATED KANDIDAT, IKKE IMPORTERT
Fem aktørgrupper (15 tallceller) er registrert fra årsrapporter/børsmeldinger med URL og tilgangsdato; i tillegg står Samkaup åpen som B-celle. Den fail-closed validatoren bekrefter radtallet, men gir fem `model_decision_required`, ett `source_gap` og `canApply:false`. Materialet er dermed en mottatt kandidatbatch, ikke et lukket gap: det er ikke navngitt menneskereviewet, PCQ-kontrollert, importdesignet eller importert. Fyller først asymmetrien DATAGAP §3.8 flagget («FI/IS 2025 mangler») når kilde-, modell- og importgatene er passert. Detaljer og claim-grenser: `data/nordisk-finanser-2025-kandidater.csv` + `-mottakslogg.md`. Kort:

| Aktør | Land | 2025-tall (primærkilde) | Kilde |
|---|---|---|---|
| Kesko (konsern) | FI | Omsetning €12 474,7 mill · sml. driftsresultat €654,9 mill | Kesko FS-release 05.02.2026 |
| Kesko dagligvare | FI | Omsetning €6 447,7 mill · driftsresultat €418,1 mill (6,5 %) | s.s. |
| S-ryhmä (S Group) | FI | Detaljomsetning €14 506 mill · marketkauppa €10 997 mill · liiketulos €495 mill | s-ryhma.fi 12.02.2026 |
| Lidl Suomi | FI | Omsetning €2 021 mill · driftsresultat €65,1 mill (regnskapsår t.o.m. 28.02.2025) | Lidl/STT 28.08.2025 |
| Hagar hf | IS | Omsetning 197 043 mill ISK · EBITDA 18 129 mill · resultat 7 394 mill (regnskapsår 2025/26) | Hagar FS 29.04.2026 |
| Festi hf | IS | Omsetning 175 727 mill ISK · EBITDA 16 001 mill · resultat 6 220 mill (2025) | Festi ársreikningur 05.02.2026 |

**Claim-grense:** dette er registrerte kildekandidater, ennå ikke navngitt menneskereviewet, PCQ-kontrollert, importert eller claim-locket. Lidl-kilden gjelder fiscal 2024 med periode slutt 28.02.2025; kandidatsettet beviser ikke at en nyere kilde ikke finnes. Hagar har avvikende periode 2025/26. Kildevaluta skal bevares; eventuell NOK-konvertering krever dokumentert valutakilde og metode etter `.claude/source-attribution-policy.md`. Konsern-/segmentrader og resultatmål må få en eksplisitt modellmapping før dry-run. Samkaup (IS) forblir et åpent `source_gap`.

### T4 · «Det Norge ikke måler» — DATERT KANDIDAT UNDER REVIEW
Kandidatgjennomgangen indikerer at flere C-hull kan ha *endret status* siden analysen: måleprogram er startet, men baseline/trend er ennå ikke komplett. Formuleringene må fortsatt gjennom kilde- og claim-review, særlig der fravær av en åpen kilde brukes som grunnlag for et nasjonalt fraværsfunn. Den planlagte presiseringen er «måling påbegynt [årstall], baseline forventet [årstall], ansvarlig [institusjon], ikke tilgjengelig ennå». Full kandidattekst i `funn/det-norge-ikke-maaler-2026-07.md`. Oppsummert:

| Grunnlagsdata | Status 2026 | Ansvarlig | Når komplett |
|---|---|---|---|
| Nasjonal SOC-baseline (karbon i jord) | JordVAAK-implementering og metodearbeid pågår siden 2023; landsdekkende systematisk overvåking ble lansert i 2026; prosjektet har ikke identifisert en publisert nasjonal baseline | NIBIO | Ingen publisert baseline eller ferdigdato identifisert i kandidatmaterialet |
| Pollinator-/insekttrend | Nasjonal overvåkingsserie siden 2020, men serien er for kort for en etablert trend. Miljødirektoratets 2026-formidling sier at fallet i 2020–2023 trolig skyldtes tilfeldig variasjon; `~14 %/år` skal ikke brukes som etablert trend | NINA/Miljødirektoratet | Lengre serie kreves; ingen robust nasjonal trend eller ferdigdato claim-locket |
| Beredskapslager matkorn | Alle kontrakter for målet på 82 500 tonn innen 2029 er tildelt, inkludert tredje/finale runde på 22 500 tonn. Faktisk lager ved utgangen av 2025 var 30 000 tonn | Landbruksdirektoratet | Mål: 82 500 tonn faktisk lager innen 2029 |
| Digestat/biorest NPK-retur | Bransjenorm finnes; prosjektet har ikke identifisert en åpen nasjonal serie for faktisk N/P/K-retur til jord | Avfall Norge / relevante myndigheter og bransjeaktører | Krever institusjonell bekreftelse før fravær kan omtales som nasjonalt funn |
| Oppdrettsslam massebalanse per anlegg/år | Prosjektet har ikke identifisert en åpen nasjonal serie som kobler produsert, samlet, behandlet og sluttbrukt slam | Fiskeridirektoratet / Miljødirektoratet / anlegg | Krever institusjonell bekreftelse; ikke claim-locket som absolutt fravær |
| Lagerkapasitet havn/kaldkjede/sentrallager | Prosjektet har ikke identifisert en åpen, node- og varekategori-spesifikk nasjonal kapasitetsserie | DSB / NVE / Landbruksdirektoratet / logistikkaktører | Krever institusjonell bekreftelse eller dokumentert innsynsutfall |

**Mulig poeng etter claim-review:** matkorn-eksemplet skiller mellom politisk mål, tildelte kontrakter og faktisk lager: 30 000 tonn var lagret ved utgangen av 2025, mens kontrakter er tildelt for opptrapping til 82 500 tonn innen 2029. De andre radene er foreløpige kandidater for institusjonell bekreftelse, ikke beviste absolutte fravær.

---

## 5. Prosess- og metodespesifikasjoner for Bølge 1-lukkingene

Dette er ulike arbeidsklasser, ikke én ferdig batch. Live readback nedenfor skiller metodeutkast, menneskekøer, dry-run-funn og databasehandlinger. Ingen skriveoperasjon er autorisert av dette dokumentet.

### T5 · Aktivitetssignal-pipeline (havbruk + villfisk, 270 aktører)
**Faktisk utgangspunkt:** seks havbruksfiler gir 120 unike org.nr. og åtte villfiskfiler 150, uten overlapp. De 270 radene er et prosjektdefinert dekningsgulv, ikke et komplett nasjonalt aktørunivers. Havbruksunderlaget har 79 dokumenterte pub-aqua-treff, 21 dokumenterte nulltreff og 20 tidlige rader uten registrert pub-aqua-kontroll. Treff dokumenterer lokalitets-/tillatelsessignal, ikke målt drift.

**Metodegrense:** eksisterende akvakulturtransform lagrer MTB-kapasitet og lisensstatus, ikke faktisk biomasse eller observasjonsdato. «Biomasse > 0 siste 12 måneder» er derfor ikke en kjørbar definisjon i dagens kode. Den eksisterende importen arbeider dessuten mot `Company.valueChainStage=seafood`, ikke det frosne Actor-utvalget. For villfisk finnes ingen implementert org.nr.→fartøy/eier→landing-kobling.

**Neste gate:** frys 270-radersutvalget med versjon; bygg read-only Actor→Company→register-ID-preflight med `matched`/`unmatched`/`ambiguous`; velg eksplisitt om havbrukssignalet er tillatelsesstatus eller faktisk observert biomasse; bygg villfiskkobling for en navngitt 12-månedersperiode; produser dry-run og review-kø. Ingen rad oppgraderes til «aktiv» eller middels konfidens før signaldefinisjonen og enhetskoblingen er kontrollert.

### T8 · N/P/K-tabellskjelett (VK4-GAP-007)
**Faktisk utgangspunkt:** R14 har satt VK4-GAP-007 til `vent`. Kilde-shortlisten definerer et nyttig minimumsskjema per celle — geografi, år, systemgrense, enhet, realisert/modellert/potensial/plan, primærlokator og PCQ — men de foreslåtte Type A-strømmene er fortsatt arbeidsnotater uten ferdig verdiuttrekk, lokator og PCQ.

**Legacy-grense:** `public/data/food-systems/nutrient-flows.json` er et eldre størrelsesordens-/proxyestimat. Det inneholder blant annet ulåste 25–30 %-verdier og en 70 %-modellfaktor, og kan ikke behandles som ferdig nytt tabellskjelett eller som validerte Type A-celler.

**Neste gate:** opprett matrisen fra cellekontrakten; migrer eksisterende JSON bare som eksplisitte legacy-kandidater; fyll én strøm om gangen med primærkilde, lokator, år, geografi, systemgrense, metodeetikett og PCQ. En tom celle blir ikke automatisk Type C; C krever en dokumentert kontroll av at den harmoniserte serien ikke er funnet.

### T9 · Alt-protein realisert volum (topp 15)
**Faktisk utgangspunkt:** repoet har ingen frosset topp-15-liste, volumproxy-kontrakt eller kjørbar pipeline. R13-ledgeren har ni blandede aktør-/teknologirader og sier at realisert fôr-grade årsvolum er tomt for alle rendyrkede nordiske aktører. En førsteforsendelse, kapasitet, godkjenningsstatus eller teknologimodenhet er ikke realisert årsvolum.

**Metodegrense:** omsetning blander produktmiks, tjenester og pris; varelager er en beholdning på balansedagen, ikke årsproduksjon, og dagens `CompanyFinancial`-/Brreg-løp inneholder uansett ikke et kontrollert varelagerfelt. Finansielle data kan brukes som svakt aktivitetssignal eller til å prioritere kontakt, ikke som kvantitativ tonnasjeproxy.

**Neste gate:** definer og frys topp-15-utvalget. Godta volum bare fra direkte produsert/solgt tonnasje eller fra en eksplisitt modell med dokumentert produktspesifikk omsetningsandel og realisert pris. Ellers står raden `C/actor-gated`. Direkte aktørforespørsel er en separat menneskeport; manglende svar er ikke et nullvolum.

### Q2 · Bibliotek-review-kø (89 rader)
Live beslutningskø har 89 `review_required`-rader: 24 er kandidater for mekanisk URL-reparasjon, 57 krever menneskelig kuratering av korte sammendrag, og 8 krever manuelt kildeoppslag. Dette er tre forskjellige arbeidsformer. Ingen rad er registrert som menneskereviewet. Q1-pilotens tre fulltekstkilder og produksjonsgate skal lukkes før en topp-50-sprint startes.

### Q3 · Tekstreparasjon — dry-run avgrenset kandidaten
De tre eksisterende reparasjonsløpene er kjørt i dry-run. Lokalt tekstløp leste 71 rader og foreslo 0 oppdateringer (17 under kvalitetsgulvet, 54 uten målbar gevinst); PDF-løpet fant 0 rader; URL-løpet leste 24 rader og foreslo 17 oppdateringer (5 uten dokument, 2 ikke ekstraherbare). De 89 review-radene er derfor ikke 89 mekaniske reparasjoner. Neste steg er menneskereview av 17-raders URL-plan, deretter kontrollert apply og kvittering — ikke en blind 89-raders batch.

### Q4 · Varig kildearkiv — audit først
Den read-only, fail-closed auditen `npm run audit:source-citation-archive-coverage` viser 2 703 `SourceCitation`-rader. For de 2 376 eksternt klare/med-note-radene har 521 varig kopi (41/154 `citable_external`, 480/2 222 `citable_with_note`), mens 1 855 trenger arkiv. Hele settet har 530 rader med `archivedUrl`, 1 389 med lokal sti og 38 med lokalt hashverifisert snapshot; disse signalene overlapper, så «archivedUrl 0 %» var feil diagnose. Gaten feiler med 1 872 blokkerende ID-er og avdekker 231 duplikatgrupper på original-URL, 85 på arkiv-URL og 15 på filhash. Neste steg er å deduplisere og prioritere før Wayback-/snapshot-dry-run; ingen nettverks- eller DB-write er kjørt.

---

## 6. Prosesspakkene for de menneskegatede hullene (Type B)

Levert som egne **beslutningsklare prosessutkast**. Det betyr at eier kan ta stilling til dem; det betyr ikke at de er utsendingsklare. Ingen er sendt, utført eller ferdig reviewet. Sammendrag her; fullt innhold i `prosess/` og `innsyn/`.

- **T1 Mission 1 — intervjupakke** (`prosess/mission-1-intervjupakke.md`): 5 målgrupper med begrunnelse, booking-epostutkast, samtykke-/bruksrettsskjema, semistrukturert intervjuguide og intervju→sitat-pipeline. Eier, personvern, samtykkenivå, scope, mottakere og personalisering må lukkes og reviewes før eventuell sending. Stopplinje innebygd: ingen sekundærkilde eller tidligere arrangements-transkript fremstilles som prosjektets egne intervjuer (jf. WP-09).
- **T2 Mission 2 — nordisk validering** (`prosess/mission-2-nordisk-validering.md`): fire svenske og fem danske kontrollrader er fylt med primærkilde, scope, tolkning og claim-grense, og separate e-postutkast er klare. Materialet er fortsatt intern desk-validering: mottaker, partnerscope, Cathrine-review og eksplisitt sendebeslutning må lukkes før eventuell sending, og konklusjoner blir ikke «partnerbekreftet» før svar faktisk foreligger.
- **T6/T10 Innsynsbrev** (`innsyn/`): fire beslutningsklare brevutkast om aksjonærregister, lagerkapasitet/beredskap, PT-mikrodata og offentlig innkjøpsvolum. Avsender/signatur, endelig scope og juridisk readback mangler. Et avslag dokumenterer et konkret tilgangsutfall med saksnummer og hjemmel; det må reviewes og beviser ikke automatisk et nasjonalt datafravær eller et C-funn.
- **T7 REKO/CSA-survey** (`innsyn/reko-csa-survey.md`): surveyutkast + mal for årsmeldingsuttrekk. Personvern, samtykke, minste rapporteringsgrense, scope, kontaktgrunnlag og skjemaoppsett må lukkes og reviewes før eventuell sending.
- **Q1 Appraisal-sprint** (`prosess/appraisal-sprint-plan.md`): prioriterings- og kapasitetsutkast. Produksjonsworkflow for topp-50 finnes ikke ennå; eksisterende manifest dekker tre piloter som fortsatt står `pending_human_review`.
- **T15 Kausalitets-caseklasse** (`prosess/t15-kausalitets-case-mal.md`): reell H2-mal med evidensnivå, alternative forklaringer, kilde-/lokatorfelt, navngitt menneskereview og tillatt språk per nivå. Ingen case eller kausal påstand er dermed ferdig vurdert.

Disse utkastene dekker **seks gap-ID-er**: T1, T2, T6, T7, T10 og Q1. At T6/T10-pakken inneholder fire brev gjør ikke fire ekstra gap ferdige. T15-malen er et H2-metodeartefakt og teller heller ikke som et lukket case.

---

## 7. Hygiene og rytme — så hull ikke gjenoppstår

### Q5 · Backlog-status-synk
De 50 R13-missionene står alle som `planned` i CSV-en (25.06) selv der intake-indeksene viser utført arbeid. Dette er fortsatt et åpent hygienehull. Før automatisk synk må statusreglene avstemmes mot kontrollnotatene; deretter kan et lite script lese R13/R14-intake-indeksene, skrive en dry-run-diff og først etter review oppdatere backlog-CSV-en. En ny teller i `/masterhjerne` er ikke i seg selv bevis på at statusklassifiseringen er riktig.

### Q6 · Interne konsistensavvik (fra masterhjerne-status §10)
Den sikre statuspropageringen er gjort: live readback viser 2 703 `SourceCitation`, 244 516 `FieldCitation`, 154 `citable_external`, 2 222 `citable_with_note`, 110 `internal_context` og 217 `blocked_unsourced`; både vanlig og strict source-audit passerer. Dette gjør ikke basen akademisk klar: appraisal står 0/417, og seed/DB-identitetspariteten har fortsatt 18 avvik (17 eksplisitt managed YouTube-kilder og den syntetiske `matsvinnloven-2025`-tesen). Matsvinnloven-reparasjonen er bare kjørt i dry-run og rapporterer `pending`/`source_absent`; apply er med vilje deaktivert og krever eksakte hasher, kontrollert DB-rolle, fersk backup og verifisert restore-kvittering. Ingen destruktiv reparasjon er gjort. Vintage-avvikene i dekningsbok/PDF-katalog må også behandles separat; et regenerert panel skal ikke skjule dem.

### Rituelle sykluser (fra MASTERPLAN §5, operasjonalisert)
- **Ukentlig:** triage av review-kø (Q2) + `npm run compute-masterhjerne` + `audit:citable`-kjeden grønn før enhver publisering.
- **Månedlig:** dekningsdashboard-refresh; URL-helse/arkiveringsrunde (Q4); digest til partnere.
- **Kvartalsvis:** claims-red-team på 10 viktigste påstander; brukersamtaler per stakeholder-linse; re-prioritering av dette programmet.
- **Halvårlig:** universe-reestimering per celle; følg NIBIO JordVAAK / NINA-publiseringer (T4 kan endre status igjen).
- **Årlig:** metode-review; personvern-/juss-audit; resiliens-rapport.

---

## 8. Beslutninger som blokkerer (samlet)

Programmet kan ikke avgjøre disse — de krever eier/partner. De blokkerer konkrete hull:

1. **[BESLUTNING] Personvern- og publiseringspolicy** (blokkerer T6-founder-lag ekstern bruk + all offentlig personflate). Publication_tier på persondata er foreslått; trenger eiervedtak + juridisk lesning. *Uten dette kan founder-/aksjonærdata hentes internt, men ikke publiseres.*
2. **[BESLUTNING] Betalt register-budsjett** (blokkerer T6 dybde + T16 kanalfordeling). Ett Proff/Forvalt-abonnement (lav kostnad) og evt. handelsdata (høy, kun ved finansiering). Anbefaling: godkjenn Proff nå, utsett handelsdata til finansiering.
3. **[BESLUTNING] Innsyns-avsender, signatur, scope og juridisk readback** — skal innsynsbrevene (T6/T10) sendes fra Gabriel personlig, fra Natural State, eller fra NCH-prosjektet, og hva er endelig avgrensning per brev? Avsender og scope må juridisk leses tilbake før eventuell utsending. Anbefaling om avsender er foreløpig Natural State som juridisk enhet, ikke et vedtak.
4. **[BESLUTNING] Intervju-samtykkenivå** (T1) — full navngiving, rolle-anonymisert, eller sektor-anonymisert? Påvirker sitatbruk i whitepaper. Anbefaling: tilby respondenten valget per sitat i godkjenningsrunden.
5. **[BESLUTNING] Mission 2-utsending** (T2) — bekreft avsender, de faktiske mottakeropplysningene, landvis scope, svarfrist og behandling/lagring av partnersvar; Cathrine må reviewe før eventuell sending. De 4+5 fylte radene er fortsatt desk-materiale, ikke partnerbekreftelse.
6. **[DESTRUKTIV GATE — IKKE KLAR FOR VEDTAK] Q6-identitetsreparasjon** — apply er deaktivert og skal ikke åpnes før eksakte hasher, kontrollert DB-rolle, fersk backup, verifisert restore-kvittering og konkret destruktiv autoritet foreligger. Anbefaling nå: behold dry-run-planen; ikke autoriser apply.

---

## 9. Suksesskriterium for programmet

Programutkastet har nådd **disposisjonsdekning**, ikke gap-lukking: hvert hull har en foreslått rute. Et gap er først ferdig når den rutens kilde-, review-, import-, menneske- og eventuelle claim-gater er passert. Med denne runden:

- **0 nye hull** er ferdig lukket.
- **2 gap** (T3 og T4) er kandidater/datert-under-review; T3 er source-gated og ikke importert.
- **6 gap-ID-er** (T1, T2, T6, T7, T10 og Q1) har prosessutkast; Q1 mangler produksjonsworkflow, og tre piloter venter navngitt menneskereview.
- **14 gap** står fortsatt i kø, hygiene eller H2; T15 har nå en metode-mal, men ingen ferdig vurdert case.
- **0 gap** er uten foreslått disposisjon. Dette er planstatus, ikke completion-status.

Det er dette som gjør forskjellen fra «vi har mye data» til «vi vet nøyaktig hva som gjenstår, og hvordan hvert stykke lukkes» — som er hele poenget med en masterhjerne.

---

*Internt styringsmateriale. Ingen formulering herfra er claim-locket. T3 er en source-gated kandidatbatch og er ikke importert. T3 og T4 skal gjennom navngitt menneskereview, relevante import-/audit-gater og claim-lock/`gate:overclaim` før ekstern bruk. Kildelokatorer og tilgangsdatoer i følgefilene er nødvendig underlag, men er ikke i seg selv bevis på fullført verifikasjon.*
