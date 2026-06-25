---
tittel: Food TG — Research Runde 12 promptpack
status: Intern promptpakke — ingen claims åpnes
eier: Gabriel
dato: 2026-06-24
scope: 50 smale prompts for underlag, kartlegginger, datagap, modeller og visualiseringsgrunnlag.
bruksregel: Kjør én prompt om gangen. Lagre output i avtalt `next_artifact`, mottaksfør funnet, og send bare modne funn videre til source-shortlist/PCQ/claim-lock.
relaterte_filer:
  - docs/project/mandates/food-tg-research-runde12-masterplan-2026-06-24.md
  - research/_status/food-tg-research-backlog-2026-06-24.csv
  - docs/project/mandates/food-tg-research-mottaksprotokoll-2026-06-24.md
---

# Food TG — Research Runde 12 promptpack

## Universal instruks for alle prompts

Du arbeider for Food TG. Du skal hente underlag, ikke skrive whitepaper.

Regler:
1. Primærkilde først. Bruk sekundærkilder bare når primær ikke finnes, og merk dem `B`.
2. Ikke gjett. Tomme celler og dokumenterte fravær er gyldige funn.
3. Skill mellom:
   - `A`: primær/verifisert.
   - `B`: sekundær, aktørrapportert eller avledet estimat.
   - `C`: ikke offentlig tilgjengelig, ikke målt, klassifisert eller epistemisk hull.
4. Skill mellom realisert volum, kapasitet, plan, potensial og hypotese.
5. Lag alltid en `Ikke si`-liste for overclaim-risiko.
6. Avslutt med anbefalt gate: source-shortlist, PCQ, claim-lock, actor-gate, forstaelse eller parkering.

Output-format:

| Felt | Svar |
|---|---|
| Kort dom | 2-4 setninger |
| Sterkeste kilde | navn, år, lokator |
| Svakeste punkt | hva er usikkert |
| Funn-tabell | tabell med kilde/status/caveat |
| Tomme celler | liste |
| Ikke si | liste |
| Anbefalt gate | én eller flere gates |

## Verdikjede per ledd og land

### R12-VALUE-001 — Ledd-profil import Norge

**Prioritet:** P0
**Tema:** Verdikjede per ledd og land
**Geo:** NO
**Forventet output:** ledd-profil table with A/B/C evidence
**Lagre output:** `research/external/r12/R12-VALUE-001-ledd-profil-import-norge.md`
**Anbefalt gate:** PCQ

**Prompt:**
Lag ledd-profil for importleddet i Norge: viktigste mat-/fôr-/innsatsvarestrømmer, sårbarhet og datagap. Bruk official trade/statistics som kildeunivers, og start med SSB 08801, Landbruksdirektoratet, NIBIO. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: registrer kilde per celle; ikke bland verdi/volum. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-VALUE-002 — Ledd-profil primærproduksjon Norge

**Prioritet:** P1
**Tema:** Verdikjede per ledd og land
**Geo:** NO
**Forventet output:** ledd-profil table
**Lagre output:** `research/external/r12/R12-VALUE-002-ledd-profil-primaerproduksjon-norge.md`
**Anbefalt gate:** PCQ

**Prompt:**
Lag ledd-profil for primærproduksjon i Norge med produksjon, selvforsyning, innsatsvarer og sårbarhet. Bruk official agriculture statistics som kildeunivers, og start med NIBIO, Helsedirektoratet, Landbruksdirektoratet. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: skille rå selvforsyning og fôrkorrigert metode. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-VALUE-003 — Ledd-profil foredling Norge

**Prioritet:** P1
**Tema:** Verdikjede per ledd og land
**Geo:** NO
**Forventet output:** processing profile
**Lagre output:** `research/external/r12/R12-VALUE-003-ledd-profil-foredling-norge.md`
**Anbefalt gate:** PCQ

**Prompt:**
Lag ledd-profil for prosessering/foredling: kapasitet, konsentrasjon, importerte råvarer og waste. Bruk industry and official sources som kildeunivers, og start med Konkurransetilsynet, årsrapporter, Landbruksdirektoratet. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: konsentrasjon er struktur, ikke intensjon. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-VALUE-004 — Ledd-profil distribusjon Norge

**Prioritet:** P1
**Tema:** Verdikjede per ledd og land
**Geo:** NO
**Forventet output:** distribution profile
**Lagre output:** `research/external/r12/R12-VALUE-004-ledd-profil-distribusjon-norge.md`
**Anbefalt gate:** PCQ

**Prompt:**
Lag ledd-profil for distribusjon og grossistledd med aktører, flaskehalser og alternative kanaler. Bruk public procurement and market reports som kildeunivers, og start med KT, Doffin, Menon, company annual reports. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: ASKO/HORECA-andeler må merkes aktørrapportert hvis ikke uavhengig. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-VALUE-005 — Nordisk ledd-sammenligning

**Prioritet:** P2
**Tema:** Verdikjede per ledd og land
**Geo:** Nordic
**Forventet output:** comparative matrix
**Lagre output:** `research/external/r12/R12-VALUE-005-nordisk-ledd-sammenligning.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Lag nordisk sammenligning av ledd-profiler: hvilke land kan lære hva av hverandre. Bruk official national statistics som kildeunivers, og start med Nordic statistical agencies. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: metoder ikke harmonisert; noter hvert avvik. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

## Resiliens og beredskap

### R12-RES-001 — Fôrkorrigert selvforsyning Norden

**Prioritet:** P0
**Tema:** Resiliens og beredskap
**Geo:** Nordic
**Forventet output:** method comparison table
**Lagre output:** `research/external/r12/R12-RES-001-forkorrigert-selvforsyning-norden.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg fôrkorrigert selvforsyning og metodeforskjeller i Norden. Bruk official food security statistics som kildeunivers, og start med NIBIO/Helsedirektoratet, Nordic agencies. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: offisiell fôrkorrigert metode finnes trolig bare NO. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-RES-002 — Beredskapslager korn fôr gjødsel

**Prioritet:** P0
**Tema:** Resiliens og beredskap
**Geo:** Nordic
**Forventet output:** stockpile matrix
**Lagre output:** `research/external/r12/R12-RES-002-beredskapslager-korn-for-gjodsel.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg beredskapslager for korn, fôr og gjødsel i nordiske land: mål vs realisert. Bruk government preparedness docs som kildeunivers, og start med LMD, Totalberedskapsmeldingen, nordiske beredskapsmyndigheter. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: klassifisert tonnasje skal stå som C. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-RES-003 — Kritiske importnoder Norge

**Prioritet:** P1
**Tema:** Resiliens og beredskap
**Geo:** NO
**Forventet output:** critical import node table
**Lagre output:** `research/external/r12/R12-RES-003-kritiske-importnoder-norge.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg kritiske importnoder for norsk matsystem: fosfat, fôrprotein, fiskeolje, soya, kaffe og kakao. Bruk trade/statistics som kildeunivers, og start med SSB 08801, Comtrade as secondary, EU sources. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: sekundær speilkilde skal ikke bli primær. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-RES-004 — Lokal verdikjede og faktisk robusthet

**Prioritet:** P1
**Tema:** Resiliens og beredskap
**Geo:** NO
**Forventet output:** evidence memo
**Lagre output:** `research/external/r12/R12-RES-004-lokal-verdikjede-og-faktisk-robusthet.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Finn hvilke lokale/korte verdikjeder faktisk øker forsyningssikkerhet, ikke bare lokal identitet. Bruk research + case evidence som kildeunivers, og start med NIBIO, Ruralis, Økologisk Norge, local food reports. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: ikke bruk lokal = resilient uten mekanisme. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

### R12-RES-005 — Transport lager og kaldkjede

**Prioritet:** P2
**Tema:** Resiliens og beredskap
**Geo:** Nordic
**Forventet output:** risk inventory
**Lagre output:** `research/external/r12/R12-RES-005-transport-lager-og-kaldkjede.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg transport-, havn-, lager- og kaldkjede-sårbarheter for mat i Norden. Bruk infrastructure/beredskap docs som kildeunivers, og start med DSB, NFD, nordiske transportmyndigheter. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: kan bli for bred; noter kun matrelevante noder. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

## Fôr og innsatsfaktorer

### R12-FEED-001 — Fiskeoljeimport Mauritania

**Prioritet:** P0
**Tema:** Fôr og innsatsfaktorer
**Geo:** NO
**Forventet output:** time series with HS codes and caveat
**Lagre output:** `research/external/r12/R12-FEED-001-fiskeoljeimport-mauritania.md`
**Anbefalt gate:** PCQ

**Prompt:**
Finn primærkilde for norsk fiskeoljeimport fra Mauritania 2020-2025. Bruk SSB 08801/PxWeb som kildeunivers, og start med SSB tabell 08801. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: Senegal/Gambia/sardinella forblir type C hvis ikke primærserie finnes. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-FEED-002 — Fôrimportavhengighet per produksjon

**Prioritet:** P0
**Tema:** Fôr og innsatsfaktorer
**Geo:** NO
**Forventet output:** species/feed dependency table
**Lagre output:** `research/external/r12/R12-FEED-002-forimportavhengighet-per-produksjon.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg norsk fôrimportavhengighet per kjøttslag og akvakultur med metode- og kildeetikett. Bruk official agriculture and aquaculture stats som kildeunivers, og start med Animalia, NIBIO, Landbruksdirektoratet, Nofima/FHF. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: ikke bland kraftfôr, proteinfraksjon og total fôrkurv. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-FEED-003 — Alternative nordiske fôrproteiner

**Prioritet:** P1
**Tema:** Fôr og innsatsfaktorer
**Geo:** Nordic
**Forventet output:** actor ledger
**Lagre output:** `research/external/r12/R12-FEED-003-alternative-nordiske-forproteiner.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Lag aktørledger for alternative nordiske fôrproteiner: realisert volum, kapasitet, plan og tomme celler. Bruk company/project primary docs som kildeunivers, og start med company releases, funding databases, public project pages. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: kapasitet er ikke realisert produksjon. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

### R12-FEED-004 — Soya og SPC-koder

**Prioritet:** P1
**Tema:** Fôr og innsatsfaktorer
**Geo:** NO
**Forventet output:** code and gap memo
**Lagre output:** `research/external/r12/R12-FEED-004-soya-og-spc-koder.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg soya/SPC-koder, sluttbruk og åpne type-C-hull for norsk fôr. Bruk customs nomenclature and trade stats som kildeunivers, og start med TARIC, SSB, Landbruksdirektoratet. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: SPC er ikke HS 2304; sluttbrukssplitt kan være C. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-FEED-005 — Musling tang og tare

**Prioritet:** P2
**Tema:** Fôr og innsatsfaktorer
**Geo:** Nordic
**Forventet output:** technology readiness table
**Lagre output:** `research/external/r12/R12-FEED-005-musling-tang-og-tare.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg musling, tang og tare som nordisk protein-/fôrråvare: realisert vs pilot vs hypotese. Bruk research and project docs som kildeunivers, og start med FHF, Nofima, Nordic project databases. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: ikke volumclaim uten primærkilde. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

## Waste, sidestrøm og R9

### R12-WASTE-001 — Marint restråstoff etter R-stige

**Prioritet:** P0
**Tema:** Waste, sidestrøm og R9
**Geo:** NO
**Forventet output:** R-ladder table
**Lagre output:** `research/external/r12/R12-WASTE-001-marint-restraastoff-etter-r-stige.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg marint restråstoff etter R-stige: humant konsum, fôr, energi, eksport og datagap. Bruk SINTEF/FHF/Nofima som kildeunivers, og start med SINTEF/FHF, Nofima 33/2025. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: utnyttet er ikke høyverdi. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-WASTE-002 — Oppdrettsslam massestrøm

**Prioritet:** P0
**Tema:** Waste, sidestrøm og R9
**Geo:** NO
**Forventet output:** mass balance memo
**Lagre output:** `research/external/r12/R12-WASTE-002-oppdrettsslam-massestrom.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg oppdrettsslam: modellerte utslipp, faktisk innsamlet volum, behandling og type-C-hull. Bruk official permits/research som kildeunivers, og start med FHF, Statsforvalter permits, Mattilsynet. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: modellert utslipp er ikke innsamlet volum. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-WASTE-003 — Digestat næringsretur Norden

**Prioritet:** P1
**Tema:** Waste, sidestrøm og R9
**Geo:** Nordic
**Forventet output:** NPK return matrix
**Lagre output:** `research/external/r12/R12-WASTE-003-digestat-naeringsretur-norden.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg nasjonal digestat-næringsretur i Norden: N/P/K realisert eller ikke målt. Bruk biogas certification/statistics som kildeunivers, og start med Avfall Sverige SPCR 120, national biogas sources. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: kun SE kan være A; andre kan være C. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-WASTE-004 — Kaffegrut og urbane sidestrømmer

**Prioritet:** P1
**Tema:** Waste, sidestrøm og R9
**Geo:** NO
**Forventet output:** waste stream memo
**Lagre output:** `research/external/r12/R12-WASTE-004-kaffegrut-og-urbane-sidestrommer.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg kaffegrut og andre urbane matavfallstrømmer: massestrøm, dagens bruk og realistisk R-nivå. Bruk waste and consumption stats som kildeunivers, og start med SSB, municipal waste sources, actor docs. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: avledet estimat må merkes som avledet. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

### R12-WASTE-005 — Prevention-tiltak matsvinn

**Prioritet:** P2
**Tema:** Waste, sidestrøm og R9
**Geo:** Nordic
**Forventet output:** prevention catalogue
**Lagre output:** `research/external/r12/R12-WASTE-005-prevention-tiltak-matsvinn.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Lag katalog over nordiske prevention-tiltak mot matsvinn før waste oppstår. Bruk policy and intervention studies som kildeunivers, og start med Matvett, EU, Nordic councils. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: prevention-effekt krever målt baseline. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

## Aktørkart og praksisfelt

### R12-ACTOR-001 — Markedshager og småskala grønt

**Prioritet:** P0
**Tema:** Aktørkart og praksisfelt
**Geo:** NO
**Forventet output:** candidate actor CSV
**Lagre output:** `research/_status/R12-ACTOR-001-markedshager-og-smaaskala-gront.md`
**Anbefalt gate:** actor-gate

**Prompt:**
Utvid regenerativ/lokalmat/permakultur-kartleggingen med norske markedshager og småskala grøntprodusenter. Bruk registries and web lists som kildeunivers, og start med Markedshager Norge, Småskala Grønt Norge, NLR. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: stub default unverified unless primary locator. Avslutt med en `Ikke si`-liste og anbefal om output skal til actor-gate, claim-lock, forstaelse eller parkering.

### R12-ACTOR-002 — REKO Norge 2025/2026

**Prioritet:** P1
**Tema:** Aktørkart og praksisfelt
**Geo:** NO
**Forventet output:** actor/status memo
**Lagre output:** `research/external/r12/R12-ACTOR-002-reko-norge-2025-2026.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg REKO Norge 2025/2026: ringer, produsenter, kunder og organisering. Bruk REKO annual docs/primary pages som kildeunivers, og start med REKO Norge årsmøte/årsmelding if available. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: 2022-tall er siste sikre hvis nyere ikke finnes. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

### R12-ACTOR-003 — Andelslandbruk etter 2023

**Prioritet:** P1
**Tema:** Aktørkart og praksisfelt
**Geo:** NO
**Forventet output:** actor list
**Lagre output:** `research/_status/R12-ACTOR-003-andelslandbruk-etter-2023.md`
**Anbefalt gate:** actor-gate

**Prompt:**
Kartlegg andelslandbruk i drift etter 2023 med status per gård og kilde. Bruk CSA maps and org pages som kildeunivers, og start med Økologisk Norge, andelslandbruk.no. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: 80-90 er anslag hvis ikke primær telling. Avslutt med en `Ikke si`-liste og anbefal om output skal til actor-gate, claim-lock, forstaelse eller parkering.

### R12-ACTOR-004 — KVANN skogshage og frønettverk

**Prioritet:** P1
**Tema:** Aktørkart og praksisfelt
**Geo:** NO
**Forventet output:** network map memo
**Lagre output:** `research/external/r12/R12-ACTOR-004-kvann-skogshage-og-fronettverk.md`
**Anbefalt gate:** actor-gate

**Prompt:**
Kartlegg KVANN, skogshage, flerårige vekster og frøbevaringsnettverk videre fra 19.06-notatet. Bruk org pages and project pages som kildeunivers, og start med KVANN, NIBIO genressurssenter, Solhatt. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: Multistrata EU-status disputed til GA/prosjekt-ID finnes. Avslutt med en `Ikke si`-liste og anbefal om output skal til actor-gate, claim-lock, forstaelse eller parkering.

### R12-ACTOR-005 — Nordisk kontekst med norsk kobling

**Prioritet:** P2
**Tema:** Aktørkart og praksisfelt
**Geo:** Nordic
**Forventet output:** Nordic context list
**Lagre output:** `research/_status/R12-ACTOR-005-nordisk-kontekst-med-norsk-kobling.md`
**Anbefalt gate:** actor-gate

**Prompt:**
Lag nordisk kontekstkart for regenerativt/permakultur/lokalmat som kun tar med noder med norsk kobling. Bruk org/project pages som kildeunivers, og start med NordGen, SESAM, Frøsamlerne, Nordic networks. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: ikke voks til globalt atlas. Avslutt med en `Ikke si`-liste og anbefal om output skal til actor-gate, claim-lock, forstaelse eller parkering.

## Distribusjon og offentlige innkjøp

### R12-DIST-001 — ASKO og HORECA-andeler

**Prioritet:** P0
**Tema:** Distribusjon og offentlige innkjøp
**Geo:** NO
**Forventet output:** verification memo
**Lagre output:** `research/external/r12/R12-DIST-001-asko-og-horeca-andeler.md`
**Anbefalt gate:** PCQ

**Prompt:**
Verifiser ASKO/HORECA-andeler mot uavhengige kilder eller nedgrader til aktørrapportert. Bruk competition and procurement sources som kildeunivers, og start med KT, Menon, Doffin, ASKO primary. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: ikke presenter 70 prosent som uavhengig fakta. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-DIST-002 — Offentlige matkontrakter regionalt

**Prioritet:** P0
**Tema:** Distribusjon og offentlige innkjøp
**Geo:** NO
**Forventet output:** regional procurement table
**Lagre output:** `research/external/r12/R12-DIST-002-offentlige-matkontrakter-regionalt.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg offentlige matkontrakter som alternativ kanal: hvem vinner rammeavtaler regionalt. Bruk Doffin/anskaffelser som kildeunivers, og start med Doffin, RIIK, fylkeskommuner, kommuner. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: nasjonal andel kan være B hvis ikke beregnet. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-DIST-003 — EMV og leverandørmakt Norden

**Prioritet:** P1
**Tema:** Distribusjon og offentlige innkjøp
**Geo:** Nordic
**Forventet output:** EMV comparison table
**Lagre output:** `research/external/r12/R12-DIST-003-emv-og-leverandormakt-norden.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg EMV-andel og leverandørmakt i Norden med primærkilder per land. Bruk market/competition authorities som kildeunivers, og start med SCB, KKV, SØA, USDA as secondary. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: DK kan være sekundær-estimat. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

### R12-DIST-004 — Grossistgate frukt grønt CEA

**Prioritet:** P1
**Tema:** Distribusjon og offentlige innkjøp
**Geo:** NO
**Forventet output:** gate evidence ledger
**Lagre output:** `research/external/r12/R12-DIST-004-grossistgate-frukt-gront-cea.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg grossistgate for frukt/grønt og CEA-aktører: hvilke nye produsenter når hvilke kjeder. Bruk actor pages and procurement docs som kildeunivers, og start med company pages, press releases, procurement docs. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: gate er struktur, ikke bevist nekt. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

### R12-DIST-005 — Leaseback og eiendomsbarrierer

**Prioritet:** P2
**Tema:** Distribusjon og offentlige innkjøp
**Geo:** NO
**Forventet output:** property mechanism memo
**Lagre output:** `research/external/r12/R12-DIST-005-leaseback-og-eiendomsbarrierer.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg leaseback/eiendom som etableringsbarriere i dagligvare med regnskap og selskapsstruktur. Bruk annual accounts and registry som kildeunivers, og start med Brreg/regnskap, annual reports. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: interne leiestrømmer kan være delvis estimert. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

## Bondeøkonomi og margin

### R12-FARM-001 — N11 bondemargin

**Prioritet:** P0
**Tema:** Bondeøkonomi og margin
**Geo:** NO
**Forventet output:** margin pressure table
**Lagre output:** `research/external/r12/R12-FARM-001-n11-bondemargin.md`
**Anbefalt gate:** PCQ

**Prompt:**
Fullfør N11 bondemargin med per-produksjonstype skvis og BFJ/NIBIO-tabeller. Bruk BFJ/NIBIO primary som kildeunivers, og start med Totalkalkylen UT-1-2026, NIBIO. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: normalisert kalkyle er ikke faktisk driftsregnskap. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-FARM-002 — Aktørgate per-kg-margin

**Prioritet:** P0
**Tema:** Bondeøkonomi og margin
**Geo:** NO
**Forventet output:** AASK brief
**Lagre output:** `docs/project/mandates/R12-FARM-002-aktorgate-per-kg-margin.md`
**Anbefalt gate:** actor-gate

**Prompt:**
Spesifiser aktørgate for per-kg-margin etter kjøperprisavtale i kjøtt og meieri. Bruk actor data requirement som kildeunivers, og start med TINE, Nortura, KLF, producer orgs. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: ikke desk-research hvis data er aktørgate. Avslutt med en `Ikke si`-liste og anbefal om output skal til actor-gate, claim-lock, forstaelse eller parkering.

### R12-FARM-003 — Gjødselsjokk 2022-2023

**Prioritet:** P1
**Tema:** Bondeøkonomi og margin
**Geo:** NO
**Forventet output:** shock response memo
**Lagre output:** `research/external/r12/R12-FARM-003-gjodselsjokk-2022-2023.md`
**Anbefalt gate:** PCQ

**Prompt:**
Kartlegg gjødselsjokk 2022-2023 og ettervirkning på produksjoner og regioner. Bruk BFJ/NIBIO/market sources som kildeunivers, og start med BFJ, NIBIO, Landbruksdirektoratet. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: årsresultat/vederlag-begrep må harmoniseres. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-FARM-004 — Samvirkemakt og bondemargin

**Prioritet:** P1
**Tema:** Bondeøkonomi og margin
**Geo:** NO
**Forventet output:** cooperative margin memo
**Lagre output:** `research/external/r12/R12-FARM-004-samvirkemakt-og-bondemargin.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg samvirkemakt sett fra bondens margin: hva kan sies strukturelt uten intensjonspåstander. Bruk governance and economics som kildeunivers, og start med TINE/Nortura reports, BFJ, academic sources. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: samvirke er ikke samme som private oligopol. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

### R12-FARM-005 — Unge bønder og distriktsøkonomi

**Prioritet:** P2
**Tema:** Bondeøkonomi og margin
**Geo:** NO
**Forventet output:** district output memo
**Lagre output:** `research/external/r12/R12-FARM-005-unge-bonder-og-distriktsokonomi.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg unge bønder, rekruttering og distriktsøkonomi som output av matsystemet. Bruk rural and farm statistics som kildeunivers, og start med NIBIO, Ruralis, SSB. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: hold dette som output/blindsone hvis datagrunnlag svakt. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

## True-cost, sufficiency og eksternaliteter

### R12-TRUE-001 — Edinburgh NMBU indikatorforsker

**Prioritet:** P0
**Tema:** True-cost, sufficiency og eksternaliteter
**Geo:** International
**Forventet output:** source identity memo
**Lagre output:** `research/external/r12/R12-TRUE-001-edinburgh-nmbu-indikatorforsker.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Identifiser Edinburgh/NMBU-forskeren og publikasjonene om manglende indikatorer og eksternaliteter. Bruk academic literature som kildeunivers, og start med Google Scholar/Crossref/university pages. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: ASR-navn er usikkert; ikke gjett person. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

### R12-TRUE-002 — TEEBAgriFood metodegrunnlag

**Prioritet:** P1
**Tema:** True-cost, sufficiency og eksternaliteter
**Geo:** International
**Forventet output:** method shortlist
**Lagre output:** `research/external/r12/R12-TRUE-002-teebagrifood-metodegrunnlag.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg TEEBAgriFood og true-cost accounting som metode for mat, men uten kronefestet modell. Bruk method literature som kildeunivers, og start med TEEBAgriFood, FAO, academic reviews. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: skyggepris er metoderisiko. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

### R12-TRUE-003 — Sufficiency og prevention

**Prioritet:** P1
**Tema:** True-cost, sufficiency og eksternaliteter
**Geo:** International
**Forventet output:** concept memo
**Lagre output:** `research/forstaelse/R12-TRUE-003-sufficiency-og-prevention.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg sufficiency og prevention i matsystemer: tiltak, evidens, og indikatorer. Bruk academic and policy sources som kildeunivers, og start med IPCC/EEA/academic sufficiency literature. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: ikke gjør normativt krav til aktørintensjon. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

### R12-TRUE-004 — Nexus rapport og SOIL-score

**Prioritet:** P1
**Tema:** True-cost, sufficiency og eksternaliteter
**Geo:** International
**Forventet output:** Nexus source card
**Lagre output:** `research/external/r12/R12-TRUE-004-nexus-rapport-og-soil-score.md`
**Anbefalt gate:** PCQ

**Prompt:**
Verifiser Nexus-rapporten, anbefalingstall og SOIL-score fra møtet. Bruk primary report som kildeunivers, og start med IPBES Nexus Assessment or correct source. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: 70 anbefalinger og SOIL-score er ASR-hypotese. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-TRUE-005 — Folkehelse som matsystemoutput

**Prioritet:** P2
**Tema:** True-cost, sufficiency og eksternaliteter
**Geo:** NO
**Forventet output:** health output gap memo
**Lagre output:** `research/external/r12/R12-TRUE-005-folkehelse-som-matsystemoutput.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg folkehelse-output for norsk matsystem: kosthold, sykdom, tilgjengelighet og datagrunnlag. Bruk public health statistics som kildeunivers, og start med FHI, Helsedirektoratet, SSB. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: helse er fase 2; ikke tallfest true-cost ennå. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

## Governance og implementering

### R12-GOV-001 — Governance-impotens-sløyfen

**Prioritet:** P0
**Tema:** Governance og implementering
**Geo:** NO
**Forventet output:** governance loop memo
**Lagre output:** `research/forstaelse/R12-GOV-001-governance-impotens-sloyfen.md`
**Anbefalt gate:** forstaelse

**Prompt:**
Test governance-impotens-sløyfen: hvilke virkemidler finnes, og hvorfor endrer de ikke struktur. Bruk law/policy/enforcement som kildeunivers, og start med Totalberedskapsmeldingen, KT, DSB, LMD/NFD. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: kausalpil er hypotese; skill virkemiddel og effekt. Avslutt med en `Ikke si`-liste og anbefal om output skal til forstaelse, claim-lock, forstaelse eller parkering.

### R12-GOV-002 — Ansvarsmatrise matberedskap

**Prioritet:** P1
**Tema:** Governance og implementering
**Geo:** NO
**Forventet output:** responsibility matrix
**Lagre output:** `research/external/r12/R12-GOV-002-ansvarsmatrise-matberedskap.md`
**Anbefalt gate:** PCQ

**Prompt:**
Lag ansvarsmatrise for matberedskap stat, fylke og kommune med hjemmel og hull. Bruk law and guidance som kildeunivers, og start med DSB, Lovdata, ministry docs. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: fylkeskommunalt hull må hjemles som fravær. Avslutt med en `Ikke si`-liste og anbefal om output skal til PCQ, claim-lock, forstaelse eller parkering.

### R12-GOV-003 — Nordiske konkurranseterskler

**Prioritet:** P1
**Tema:** Governance og implementering
**Geo:** Nordic
**Forventet output:** policy comparison table
**Lagre output:** `research/external/r12/R12-GOV-003-nordiske-konkurranseterskler.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg nordiske regulatoriske terskler mot dagligvarekonsentrasjon og EMV-preferanse. Bruk competition law som kildeunivers, og start med KKV, KT, KFST, Swedish authority. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: ikke bland forslag og vedtatt lov. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

### R12-GOV-004 — Sirkulære tiltak og konverteringsbarrierer

**Prioritet:** P1
**Tema:** Governance og implementering
**Geo:** International
**Forventet output:** conversion failure ledger
**Lagre output:** `research/external/r12/R12-GOV-004-sirkulaere-tiltak-og-konverteringsbarriere.md`
**Anbefalt gate:** source-shortlist

**Prompt:**
Kartlegg implementeringsbarrierer for sirkulære mattiltak: forskning som ikke konverterer. Bruk case literature som kildeunivers, og start med Infarm, Mycorena, Rest, Plantagon, academic sources. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: konkurs er ikke bevis mot teknologi alene. Avslutt med en `Ikke si`-liste og anbefal om output skal til source-shortlist, claim-lock, forstaelse eller parkering.

### R12-GOV-005 — Finansiering som passer formålet

**Prioritet:** P2
**Tema:** Governance og implementering
**Geo:** Nordic
**Forventet output:** funding fit matrix
**Lagre output:** `docs/project/mandates/R12-GOV-005-finansiering-som-passer-formaalet.md`
**Anbefalt gate:** internal

**Prompt:**
Kartlegg finansieringsmuligheter som støtter Food TG-tilnærmingen uten å endre analyseformålet. Bruk funding programmes som kildeunivers, og start med Innovation Norway, Nordic Innovation, EU programmes. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: ikke funding for fundingens skyld. Avslutt med en `Ikke si`-liste og anbefal om output skal til internal, claim-lock, forstaelse eller parkering.

## Visualisering og modellering

### R12-VIZ-001 — Datakrav for ledd-profil-visualisering

**Prioritet:** P0
**Tema:** Visualisering og modellering
**Geo:** Nordic
**Forventet output:** visual data contract
**Lagre output:** `docs/project/mandates/R12-VIZ-001-datakrav-for-ledd-profil-visualisering.md`
**Anbefalt gate:** internal

**Prompt:**
Definer datakrav for ledd-profil-visualisering per land og verdikjedeledd. Bruk existing + required data som kildeunivers, og start med R4/R5 outputs, official stats. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: visualisering skal vise tomme celler. Avslutt med en `Ikke si`-liste og anbefal om output skal til internal, claim-lock, forstaelse eller parkering.

### R12-VIZ-002 — Spider og radarmodell

**Prioritet:** P1
**Tema:** Visualisering og modellering
**Geo:** Internal
**Forventet output:** model spec
**Lagre output:** `docs/project/mandates/R12-VIZ-002-spider-og-radarmodell.md`
**Anbefalt gate:** internal

**Prompt:**
Lag spesifikasjon for spider/radarmodell med økonomi, miljø, beredskap og implementeringstid. Bruk method design som kildeunivers, og start med R12 source outputs. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: score uten kilde skal være null/tomt. Avslutt med en `Ikke si`-liste og anbefal om output skal til internal, claim-lock, forstaelse eller parkering.

### R12-VIZ-003 — Kausalkart L1-L5

**Prioritet:** P1
**Tema:** Visualisering og modellering
**Geo:** Internal
**Forventet output:** causal loop evidence table
**Lagre output:** `research/forstaelse/R12-VIZ-003-kausalkart-l1-l5.md`
**Anbefalt gate:** forstaelse

**Prompt:**
Lag underlag for kausalkart L1-L5 med evidensstyrke per pil. Bruk synthesis evidence som kildeunivers, og start med systemmodell, R4/R5/R6. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: piler er hypoteser, ikke målt kausalitet. Avslutt med en `Ikke si`-liste og anbefal om output skal til forstaelse, claim-lock, forstaelse eller parkering.

### R12-VIZ-004 — Datagap-figur-underlag

**Prioritet:** P1
**Tema:** Visualisering og modellering
**Geo:** Nordic
**Forventet output:** datagap table
**Lagre output:** `docs/project/mandates/R12-VIZ-004-datagap-figur-underlag.md`
**Anbefalt gate:** internal

**Prompt:**
Lag datagap-figur-underlag: hva måles ikke, av hvem, og hva skal til. Bruk type-C findings som kildeunivers, og start med R4/R5/R6 + new prompts. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: type-C er funn, ikke feil. Avslutt med en `Ikke si`-liste og anbefal om output skal til internal, claim-lock, forstaelse eller parkering.

### R12-VIZ-005 — Whitepaper og deck uttaksoversikt

**Prioritet:** P2
**Tema:** Visualisering og modellering
**Geo:** Internal
**Forventet output:** figure candidate inventory
**Lagre output:** `docs/project/mandates/R12-VIZ-005-whitepaper-og-deck-uttaksoversikt.md`
**Anbefalt gate:** internal

**Prompt:**
Lag whitepaper/deck uttaksoversikt: hvilke funn kan bli figur, tabell eller casekort. Bruk curated evidence som kildeunivers, og start med claim-lock and PCQ outputs. Lag en kompakt funn-tabell med rad for indikator/aktør/land, år eller periode, lokator, kildeklasse A/B/C og caveat. Skill tydelig mellom realisert volum, kapasitet, plan, potensial og hypotese der det er relevant. Registrer tomme celler som egne funn, særlig der data ikke er offentlig, ikke målt eller krever aktørtilgang. Overclaim-vakt: ingen figur uten gate/status. Avslutt med en `Ikke si`-liste og anbefal om output skal til internal, claim-lock, forstaelse eller parkering.
