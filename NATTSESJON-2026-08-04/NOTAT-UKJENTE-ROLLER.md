# NOTAT — ukjente roller i AP-10

**Dato:** 2026-08-04

**Status:** Provisorisk rolleforslag. Ingen rolle er promotert, og `knowledge/corpus/corpus-role-classification-queue.v1.jsonl` er ikke endret.

## Kontrollfunn

AP-10-briefen beskriver 123 ukjente roller. Live kontroll av den kanoniske køen viste 124 rader:

- 122 rader med `ruleId=no_unambiguous_role_rule`.
- 2 rader med `ruleId=known_legacy_alias_identity_mismatch`.
- 48 av de 124 radene har en fil som faktisk finnes i AP-10-worktree-en.
- 76 rader mangler bytes på den kanoniske stien, eller har ingen `canonicalPath`.

De 48 lesbare radene er foreslått med rolle basert på faktisk innhold og tydelige kontrollmarkører. De 76 øvrige er beholdt som `unknown` med lav konfidens; tittel eller filsti alene er ikke brukt til å late som om innholdet er lest.

Rolleordene betyr her:

- `internal_synthesis`: intern analyse, prosjekttekst, lokal snapshot eller case-/researchsyntese; ikke primærkilde.
- `operational_control`: kjøreliste, mottaks-/auditlogg, karantene eller annen prosesskontroll; ikke evidens.
- `unknown`: bytes mangler eller identiteten er ikke lesbar nok til en forsvarlig rollebeslutning.

## 1. Lesbare rader — forslag med høy konfidens

### Interne prosjektartefakter

Disse fire filene er lesbare og viser prosjekt-/søknads-/notatkarakter. De foreslås som `internal_synthesis`, ikke som `primary_evidence`.

| identityKey | canonicalPath | foreslått rolle | konfidens |
|---|---|---|---|
| `document:cmp8xyrmf0000xcvmz069urhb` | `Just now (12.Revise-Gab) Nordic Circular Food systems  - V.2.10-07-24.docx.md` | `internal_synthesis` | høy |
| `document:cmp8xyrng0001xcvmsgjs1ldu` | `1. Food system_ Oslo Innovasjons program 2025 .md` | `internal_synthesis` | høy |
| `document:cmp8xyrp30005xcvmisr8k3s2` | `Untitled document.md` | `internal_synthesis` | høy |
| `document:cmp8xyrps000axcvm1nznwfrh` | `1. Food system_ Oslo Innovasjons program 2025  (1).md` | `internal_synthesis` | høy |

De to Oslo-filene har mulig duplikatrelasjon, men det er ikke gjort noen identity merge.

### Lokale `research/report-*.md`-snapshots

Disse 22 lesbare rapportfilene har lokal snapshot-/remediation-markør i headeren: innholdet er hentet fra eksisterende DB-tekst og er en locator-/dekningsartefakt, ikke ny kildeverifikasjon. De foreslås derfor som `internal_synthesis`.

| identityKey | canonicalPath | rolle | konfidens |
|---|---|---|---|
| `document:cmppajytq000lnjvmyke545yn` | `research/report-evida-biogasstatus-danmark-2024.md` | `internal_synthesis` | høy |
| `document:cmppajytu000mnjvm08iarq3v` | `research/report-jordbruksverket-livsmedelskonsumtion-sverige-2024.md` | `internal_synthesis` | høy |
| `document:cmppajytz000nnjvmc3fmzqgc` | `research/report-finland-nutrition-recommendations-2024.md` | `internal_synthesis` | høy |
| `document:cmppajyur000vnjvm4yz7gbmx` | `research/report-trolle-2024-fbdg-environmental-sustainability.md` | `internal_synthesis` | høy |
| `document:cmppajyux000xnjvmzf93ke10` | `research/report-ifro-danish-soy-imports-2025.md` | `internal_synthesis` | høy |
| `document:cmppajyvn0015njvm6x39ztvs` | `research/report-biogas-danmark-outlook-2024.md` | `internal_synthesis` | høy |
| `document:cmppajyvq0016njvm54pgm4sa` | `research/report-luke-peat-soils-roadmap-finland-2024.md` | `internal_synthesis` | høy |
| `document:cmppajyw10019njvmnuoox38a` | `research/report-statistics-finland-biogas-2024.md` | `internal_synthesis` | høy |
| `document:cmppajyw6001anjvm95a7xl8g` | `research/report-valio-sustainability-report-2024.md` | `internal_synthesis` | høy |
| `document:cmppajyx7001lnjvmznrvwwtg` | `research/report-jackson-holm-2024-food-sustainability-dimensions.md` | `internal_synthesis` | høy |
| `document:cmppajyxb001mnjvm618meabc` | `research/report-riksrevisionen-2025-jordbrukets-klimatomstallning.md` | `internal_synthesis` | høy |
| `document:cmppajyxg001nnjvmx2x39jef` | `research/report-biokierto-biogas-finland-2030-2040-2024.md` | `internal_synthesis` | høy |
| `document:cmppajyyi001xnjvm9v3f2zzf` | `research/report-salling-coop-danmark-2025.md` | `internal_synthesis` | høy |
| `document:cmppajyyl001ynjvm4bdc2jvs` | `research/report-agrianalyse-bondens-andel-2025.md` | `internal_synthesis` | høy |
| `document:cmppajyz50024njvmgjezol1f` | `research/report-harwatt-2024-environmental-sustainability-nordic-baltic.md` | `internal_synthesis` | høy |
| `document:cmppajyz90025njvm7honuym3` | `research/report-erkkola-2025-nnr-evidence-to-action.md` | `internal_synthesis` | høy |
| `document:cmppajyzc0026njvmqo4u2hqx` | `research/report-naturvardsverket-livsmedelsavfall-sverige-2024.md` | `internal_synthesis` | høy |
| `document:cmppgazam0000g5vmg0rcwk66` | `research/report-konkurransetilsynet-dagligvare-2025.md` | `internal_synthesis` | høy |
| `document:cmppgazb10001g5vmfbv7rp2t` | `research/report-miljostyrelsen-madspild-2025.md` | `internal_synthesis` | høy |
| `document:cmppgazb60002g5vm1iwy5j0v` | `research/report-livsmedelsverket-skolor-2025.md` | `internal_synthesis` | høy |
| `document:cmppghqdv0000vfvm9j0h98zo` | `research/report-luke-food-waste-diary-2025.md` | `internal_synthesis` | høy |
| `document:cmppghqe90001vfvmbwp87wah` | `research/report-livsmedelsforetagen-resiliens-2025.md` | `internal_synthesis` | høy |

`research/thesis-matsvinnloven-2025.md` har uttrykkelig karantene-/placeholder-markør og foreslås som `operational_control`, ikke som kilde:

| identityKey | canonicalPath | rolle | konfidens |
|---|---|---|---|
| `document:cmppas6oi00003evmux65v0s6` | `research/thesis-matsvinnloven-2025.md` | `operational_control` | høy |

### Case-avsjekk og intern research

Frontmatter og statusmarkører viser `Intern analyse`, `Kontrollert intern kjøring`, research-subagent-/claim-lock-kontekst og interne source ledgers. De 19 analysefilene foreslås som `internal_synthesis`.

| identityKey | canonicalPath | rolle | konfidens |
|---|---|---|---|
| `document:cmqgio8kd001m4nvm2mijo56l` | `docs/project/analysis/case-avsjekk/avsjekk-01-kaffe-brasil-2026-06-12.md` | `internal_synthesis` | høy |
| `document:cmqgio8kf001n4nvmbfipbanm` | `docs/project/analysis/case-avsjekk/avsjekk-02-kakao-elfenbenskysten-2026-06-12.md` | `internal_synthesis` | høy |
| `document:cmqgio8kj001o4nvmdrl94syb` | `docs/project/analysis/case-avsjekk/avsjekk-03-valio-finland-2026-06-12.md` | `internal_synthesis` | høy |
| `document:cmqgio8km001p4nvm59do4emo` | `docs/project/analysis/case-avsjekk/avsjekk-04-distribusjon-adoption-2026-06-12.md` | `internal_synthesis` | høy |
| `document:cmqgio8ko001q4nvmgf2if6yo` | `docs/project/analysis/case-avsjekk/avsjekk-05-spillvarme-2026-06-12.md` | `internal_synthesis` | høy |
| `document:cmqgio8kr001r4nvm459jpsbs` | `docs/project/analysis/case-avsjekk/avsjekk-06-fish-restrastoff-2026-06-12.md` | `internal_synthesis` | høy |
| `document:cmqgio8ku001s4nvmes6yii8d` | `docs/project/analysis/case-avsjekk/avsjekk-07-skottland-polen-2026-06-12.md` | `internal_synthesis` | høy |
| `document:cmqgio8kx001t4nvm84c9oxsa` | `docs/project/analysis/case-avsjekk/deep-research-dist-p-dist-1-2026-06-13.md` | `internal_synthesis` | høy |
| `document:cmqgio8l1001u4nvmc4hfhqv4` | `docs/project/analysis/case-avsjekk/deep-research-fish-p-fish-1-p-skot-2-2026-06-13.md` | `internal_synthesis` | høy |
| `document:cmqgio8l4001v4nvmyteowiws` | `docs/project/analysis/case-avsjekk/deep-research-fish-p-fish-2-2026-06-13.md` | `internal_synthesis` | høy |
| `document:cmqgio8l7001w4nvmozqz1870` | `docs/project/analysis/case-avsjekk/deep-research-rp01-norway-value-chain-2026-06-15.md` | `internal_synthesis` | høy |
| `document:cmqgio8la001x4nvm0mxrh39f` | `docs/project/analysis/case-avsjekk/deep-research-rp02-norway-brasil-feed-trade-2026-06-15.md` | `internal_synthesis` | høy |
| `document:cmqgio8ld001y4nvmk3pvbj7f` | `docs/project/analysis/case-avsjekk/deep-research-rp03-r9-value-chain-matrix-2026-06-15.md` | `internal_synthesis` | høy |
| `document:cmqgio8lg001z4nvmfssk06jw` | `docs/project/analysis/case-avsjekk/deep-research-rp04-food-waste-contamination-2026-06-15.md` | `internal_synthesis` | høy |
| `document:cmqgio8lj00204nvm7t0c70qo` | `docs/project/analysis/case-avsjekk/deep-research-rp05-nutrient-loops-2026-06-15.md` | `internal_synthesis` | høy |
| `document:cmqgio8ln00214nvmh9xfldx7` | `docs/project/analysis/case-avsjekk/deep-research-rp06-success-failure-ledger-2026-06-15.md` | `internal_synthesis` | høy |
| `document:cmqgio8lq00224nvmqhd8rnku` | `docs/project/analysis/case-avsjekk/deep-research-rp07-media-narratives-2026-06-15.md` | `internal_synthesis` | høy |
| `document:cmqgio8ls00234nvmca7d4tss` | `docs/project/analysis/case-avsjekk/deep-research-rp08-spillvarme-2026-06-15.md` | `internal_synthesis` | høy |
| `document:cmqgio8lv00244nvm99ns3wi0` | `docs/project/analysis/case-avsjekk/deep-research-valio-p-valio-1-2026-06-13.md` | `internal_synthesis` | høy |

De to siste lesbare case-avsjekk-filene er prosesskontroller:

| identityKey | canonicalPath | rolle | konfidens |
|---|---|---|---|
| `document:cmqgio8lz00254nvmcj3tilvd` | `docs/project/analysis/case-avsjekk/kjoreordre-case-avsjekk-prompter-2026-06-12.md` | `operational_control` | høy |
| `document:cmqgio8m100264nvm01hhjegb` | `docs/project/analysis/case-avsjekk/mottak-deep-research-1206-2026-06-13.md` | `operational_control` | høy |

## 2. Ulest/manglende bytes — beholdt som unknown

Følgende 76 rader er ikke lesbare i AP-10-worktree-en. Alle foreslås fortsatt som `unknown`, konfidens `lav`, med begrunnelse: “canonical bytes mangler; rolle kan ikke avgjøres uten å lese filen”. Tittel og sti er tatt med for videre triage, men er ikke brukt som rollebevis.

### Root-/arkiv-/statusmateriale

| identityKey | canonicalPath | foreslått rolle | konfidens |
|---|---|---|---|
| `document:cmp8xyhme0002vvvm9aiy58ow` | `DATA-READINESS-SLUTTRAPPORT.md` | `unknown` | lav |
| `document:cmp8xyhp60007vvvmpm2qxqrh` | `DOWNLOAD-RESULTAT.md` | `unknown` | lav |
| `document:cmp8xyhq4000avvvmaqsedea3` | `HTML-TRIAGE.md` | `unknown` | lav |
| `document:cmp8xyhqb000bvvvmlilrce47` | `INCOMING-SOURCES.md` | `unknown` | lav |
| `document:cmp8xyhqq000evvvmuurz019e` | `MANUELL-NEDLASTING-P1.md` | `unknown` | lav |
| `document:cmp8xyhs0000gvvvmz5jh8qh0` | `ORPHAN-REVIEW.md` | `unknown` | lav |
| `document:cmp8xyhsw000jvvvmu17h3m5a` | `PLATTFORM-KOBLING.md` | `unknown` | lav |
| `document:cmp8xyhu4000mvvvmg93hy5i4` | `REPORT-SOURCEURL-GAP-13.md` | `unknown` | lav |
| `document:cmp8xyhvr000pvvvmq1yb2skh` | `RESEARCH-MISSIONS.md` | `unknown` | lav |
| `document:cmp8xyhwk000qvvvmbypvf898` | `URL-HEALTH.md` | `unknown` | lav |
| `document:cmp8xyii1002avvvmx7at07tw` | `arkiv-sortert/Food Research Process 20.04.26/00_Working_Files/compass_artifact_wf-ec2d735b-d33b-4ffa-a5ba-7877ce1d1a3c_text_markdown.md` | `unknown` | lav |
| `document:cmp8xyiiq002bvvvmpbftngcu` | `arkiv-sortert/Food Research Process 20.04.26/00_Working_Files/deep-research-report (39).md` | `unknown` | lav |
| `document:cmp8xyiiv002cvvvmhe0obnkj` | `arkiv-sortert/Food Research Process 20.04.26/00_Working_Files/deep-research-report (40).md` | `unknown` | lav |
| `document:cmp8xyija002dvvvmikihtyfs` | `arkiv-sortert/Food Research Process 20.04.26/00_Working_Files/deep-research-report (41).md` | `unknown` | lav |
| `document:cmp8xyijm002evvvmjt7jt0p4` | `arkiv-sortert/Food Research Process 20.04.26/00_Working_Files/deep-research-report (42).md` | `unknown` | lav |
| `document:cmp8xyijw002fvvvmce7tra1i` | `arkiv-sortert/Food Research Process 20.04.26/00_Working_Files/deep-research-report (43).md` | `unknown` | lav |
| `document:cmp8xyikp002gvvvmaxpvmw52` | `arkiv-sortert/Food Research Process 20.04.26/00_Working_Files/deep-research-report (44).md` | `unknown` | lav |
| `document:cmp8xyilj002hvvvmummkrxrf` | `arkiv-sortert/Food Research Process 20.04.26/00_Working_Files/deep-research-report (45).md` | `unknown` | lav |
| `document:cmp8xyim8002ivvvmiltg6yks` | `arkiv-sortert/Food Research Process 20.04.26/00_Working_Files/deep-research-report (46).md` | `unknown` | lav |
| `document:cmp8xyimz002jvvvmfvge1s95` | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Havforskningsinstituttet - rapport fra havforskningen 2024 4 (2024).md` | `unknown` | lav |
| `document:cmp8xyin3002kvvvm9gea1jx5` | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Havforskningsinstituttet - rapport fra havforskningen 2025 14 (2024).md` | `unknown` | lav |
| `document:cmp8xyin6002lvvvmegjygzej` | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Havforskningsinstituttet - rapport fra havforskningen 2026 7 (2024).md` | `unknown` | lav |
| `document:cmp8xyin9002mvvvm5yj3i8cl` | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Lovdata - 2020 04 17 29 (2024).md` | `unknown` | lav |
| `document:cmp8xyinb002nvvvmhvaczvvv` | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Lovdata - 2026 04 17 601 (2024).md` | `unknown` | lav |
| `document:cmp8xyio2002ovvvm856027sz` | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Regjeringen - Meld St 25 (2024-2025) Ch 10 Et matsystem for framtiden.md` | `unknown` | lav |
| `document:cmp8xyio8002pvvvmg068d96b` | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Regjeringen - Meld St 27 (2019-2020) Ch 2 Daglegvare og konkurranse.md` | `unknown` | lav |
| `document:cmp8xyioe002qvvvmmxb8p8oq` | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Regjeringen - Prop 33 L (2019-2020) Ch 2 Bakgrunn for lovforslag om god handelsskikk.md` | `unknown` | lav |
| `document:cmp8xyion002rvvvmvv80wd2f` | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Regjeringen - Prop 4 L (2025-2026) Ch 2 Bakgrunn for flytting av Dagligvaretilsynet.md` | `unknown` | lav |
| `document:cmp8xyiou002svvvmy2hqqptj` | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Regjeringen - meld.-st.-25-20242025-id3095592 (2024).md` | `unknown` | lav |
| `document:cmp8xyipc002tvvvm4kvh96wn` | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Regjeringen - meld.-st.-27-20192020-id2714670 (2024).md` | `unknown` | lav |
| `document:cmp8xyiph002uvvvmbqqbrwt9` | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Regjeringen - prop.-33-l-20192020-id2681097 (2024).md` | `unknown` | lav |
| `document:cmp8xyipl002vvvvmvvfbmvgg` | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Regjeringen - prop.-4-l-20252026-id3124887 (2024).md` | `unknown` | lav |
| `document:cmp8xyipn002wvvvmpctilh3p` | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Stortinget - inns 202324 258s (2024).md` | `unknown` | lav |
| `document:cmp8xyiqc002xvvvmqsbn9a7l` | `arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Stortinget - inns 202526 130s (2024).md` | `unknown` | lav |
| `document:cmp8xyiqf002yvvvmyk1y50me` | `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/PMC - 9727232 (2024).md` | `unknown` | lav |
| `document:cmp8xyiqi002zvvvmhue2ncq6` | `arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/PubMed - 39280774 (2024).md` | `unknown` | lav |
| `document:cmp8xyiqk0030vvvmylvows3u` | `arkiv-sortert/Food Research Process 20.04.26/08_Food_Security_Agriculture_And_Seafood/Riksrevisjonen - matsikkerhet og beredskap pa landbruksomradet (2024).md` | `unknown` | lav |
| `document:cmp8xymu600g4vvvm4yby8uo8` | `cathrine-ten-step-oppsummering.md` | `unknown` | lav |
| `document:cmp8xyprv00n6vvvmdyv6plop` | `exa-circular-actors-2026-04-21.md` | `unknown` | lav |
| `document:cmp8xypry00n7vvvmkyww0eat` | `exa-search-findings-2026-04-21.md` | `unknown` | lav |
| `document:cmp8xyq5m00onvvvmpeqt0ixj` | `interviews/aktorkart-systematisk-2026.md` | `unknown` | lav |
| `document:cmp8xyq5u00oovvvmvdsp42ac` | `interviews/landbrukarena-prioritert-intervjuguide-2026-03-19.md` | `unknown` | lav |
| `document:cmp8xyq6c00opvvvm150tfjo0` | `interviews/landbrukarena-transkript-essens-2026-03-19.md` | `unknown` | lav |
| `document:cmp8xyq6h00oqvvvmwkoee6go` | `interviews/nordisk-aktorkart-perplexity-2026.md` | `unknown` | lav |
| `document:cmp8xyq6n00orvvvmj33y0nqs` | `landbrukarena_transcripts/ALL_TRANSCRIPTS.md` | `unknown` | lav |
| `document:cmp8xyq7100osvvvmpuxfcll3` | `landbrukarena_transcripts/ALL_TRANSCRIPTS_WITH_LOCAL_ASR.md` | `unknown` | lav |
| `document:cmp8xyq7y00otvvvmji1zbvnd` | `meetings/mote-og-transkripsjonsaudit-2026-03-18.md` | `unknown` | lav |
| `document:cmp8xyr7300swvvvm7zu149w1` | `statusrapport-mars-2026.md` | `unknown` | lav |

### Rammeverk- og analysefiler

| identityKey | canonicalPath | foreslått rolle | konfidens |
|---|---|---|---|
| `document:cmp8xyqxf00rmvvvmebjgqn7b` | `rammeverk/connections/cybersyn-mcnamara.md` | `unknown` | lav |
| `document:cmp8xyqxi00rnvvvmsb81z2zp` | `rammeverk/connections/tidslinje.md` | `unknown` | lav |
| `document:cmp8xyqy100rovvvmme291xqb` | `rammeverk/connections/vol1-foundations.md` | `unknown` | lav |
| `document:cmp8xyqy700rpvvvmshqtod7w` | `rammeverk/connections/vol2-deep-structure.md` | `unknown` | lav |
| `document:cmp8xyqya00rqvvvm3b4df4dc` | `rammeverk/connections/vol3-urbanism.md` | `unknown` | lav |
| `document:cmp8xyqyh00rrvvvmsge1iive` | `rammeverk/connections/vol4-pattern-recognition.md` | `unknown` | lav |
| `document:cmp8xyqyk00rsvvvmr5r7k5zz` | `rammeverk/deep-research-promptpack-nordic-circular-food-landscape-2026-04-20.md` | `unknown` | lav |
| `document:cmp8xyqys00rtvvvmzktyvsvc` | `rammeverk/forskningsmasterliste-v1.md` | `unknown` | lav |
| `document:cmp8xyqyv00ruvvvmhsdfwpjy` | `rammeverk/forskningsmasterliste.md` | `unknown` | lav |
| `document:cmp8xyqyy00rvvvvmeg8peilr` | `rammeverk/github-kodebase-referanser-2026-03-18.md` | `unknown` | lav |
| `document:cmp8xyqz100rwvvvmv8hk70pc` | `rammeverk/grand-unified-theory.md` | `unknown` | lav |
| `document:cmp8xyqz600rxvvvmo6y023fz` | `rammeverk/leveranseplan-wp3-food-systems.md` | `unknown` | lav |
| `document:cmp8xyqza00ryvvvm4rx3tpoe` | `rammeverk/materialkart-databaseflyt-og-oppskalering-2026-03-18.md` | `unknown` | lav |
| `document:cmp8xyqzf00rzvvvm91cq98o2` | `rammeverk/metaforer-og-visualisering.md` | `unknown` | lav |
| `document:cmp8xyqzn00s0vvvmhmmhvft1` | `rammeverk/narrativ-struktur.md` | `unknown` | lav |
| `document:cmp8xyr0d00s1vvvmwxyqqmje` | `rammeverk/perplexity-masterliste-food-systems-2026.md` | `unknown` | lav |
| `document:cmp8xyr0t00s2vvvmv9mmelyp` | `rammeverk/perplexity-promptpack-møte7-2026-04-20.md` | `unknown` | lav |
| `document:cmp8xyr1700s4vvvmb787eg6o` | `rammeverk/prompt-dekning-og-neste-perplexity-fase-2026-03-18.md` | `unknown` | lav |
| `document:cmp8xyr1d00s5vvvmqsvlpdjy` | `rammeverk/prosjektgjennomgang-food-systems-2026.md` | `unknown` | lav |
| `document:cmp8xyr1k00s6vvvmuim0ytlj` | `rammeverk/research-prompts-og-innsiktsprosesser.md` | `unknown` | lav |
| `document:cmp8xyr1s00s7vvvmfcmaxr5k` | `rammeverk/sirkulaer-matsystem-rammeverk.md` | `unknown` | lav |
| `document:cmp8xyr2200s8vvvm7xwmuofu` | `rammeverk/systemteori-perspektiver.md` | `unknown` | lav |
| `document:cmp8xyr2700s9vvvmhd94t79z` | `rammeverk/teori-ekstrapolering.md` | `unknown` | lav |
| `document:cmp8xyr2e00savvvm4tgqxxky` | `rammeverk/underlagskartlegging-dokumentkorpus-og-tilgjengelighet-2026-03-18.md` | `unknown` | lav |

### Legacy alias-mismatch og manglende evidence-pack-bytes

Disse to radene er også en del av de 124 ukjente. De må ikke overskrives eller behandles som slettbare fordi aliaset er uklart.

| identityKey | canonicalPath | foreslått rolle | konfidens |
|---|---|---|---|
| `document:cmppajyvb0012njvmnphhze07` | `research/evidence-pack/nordisk/karlstad-declaration-2024.pdf` | `unknown` | lav |
| `document:cmppajyve0013njvmw7zok4yr` | `research/evidence-pack/nordisk/nordic-food-alert-2025.pdf` | `unknown` | lav |

### Øvrige manglende bytes

| identityKey | canonicalPath | foreslått rolle | konfidens |
|---|---|---|---|
| `document:cmq8rhos300gekdvm0a9cpow5` | `data-readiness/eierskap-tree-revisjon.md` | `unknown` | lav |
| `document:cmql055tu00gh76vmj6phk5v1` | `brreg-datatilgang-rapport-2026-06-16.md` | `unknown` | lav |

## 3. Regel- og handoff-forslag

Dette er forslag til en fremtidig eiergjennomgang, ikke implementerte køregler:

1. `research/report-*.md` med lokal DB-snapshot-/locator-remediation-header kan foreslås som `internal_synthesis`, med eksplisitt unntak dersom en fil faktisk inneholder originalkildebytes og autoritativ provenance.
2. `docs/project/analysis/case-avsjekk/**` med `Intern analyse` eller `Kontrollert intern kjøring` kan foreslås som `internal_synthesis`.
3. Filnavn som `kjoreordre`, `mottak`, `audit`, `queue` og eksplisitte karantenemarkører kan foreslås som `operational_control`, men bare etter innholdslesing.
4. `research/evidence-pack/**` må ikke klassifiseres som `primary_evidence` bare fordi filstien ser kildeaktig ut. Content-bound bytes, identitet, rettighet og provenance må være tilgjengelig.
5. Ukjente root-/arkiv-/rammeverksfiler må leses fra en kontrollert og autoritativ worktree før rolleforslag kan heves fra `unknown`.

## Kontrollgrense

Ingen køfelt, register, database eller research/evidence-pack er endret. Det er heller ikke lastet ned, rekonstruert eller kopiert noen av de 76 manglende filene. En fremtidig eier må først skaffe lesbare bytes og utstede rolle-/provenancekvittering før noen rad kan markeres som avklart.
