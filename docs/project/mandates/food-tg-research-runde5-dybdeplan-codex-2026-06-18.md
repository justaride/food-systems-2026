---
tittel: Food TG — Research runde 5: dybdeplan for Codex (goal-strukturert)
status: Aktiv arbeidsordre (utkast v0.1) — for Codex/goals-kjøring
eier: Gabriel
dato: 2026-06-18
scope: >
  Ambisiøs, men arkitekturert dybderunde som Codex kan jobbe seg gjennom over mange timer. Spenner over
  fire temaklynger (fôr/import, sirkularitet/sidestrømmer, marked/distribusjon, governance/beredskap),
  balansert mellom å gjøre eksisterende felt SITERBARE (re-pull + claim-lock) og å åpne NY MARK. Hvert
  goal er selvstendig, har primærkilde-krav og en definition-of-done = innebygd adversariell verifikasjon
  + relevant gate. Bygger direkte på runde 4-kampanjen (DRO-R4) og dybdeauditen 18.06.
bruksregel: >
  Ingen claim åpnes av denne fila. Datasøk-output går gjennom kontrollstacken (mottak → SRC/PCQ → claim-lock
  → casestatus). Forståelse-output merkes «forståelse — ikke faktastemme» og importeres aldri som fakta.
  Alt desk/primær — ingen aktørkontakt (type B forblir markert, ikke kontaktet). Wageningen-guardrail gjelder:
  WUR-score/Moerman aldri som nordisk bevis. Primærkilde-først: et goal som bare kan svares med sekundær/NGO
  styrker ikke underlaget — det merkes estimat og holdes ute av claim-lock.
relaterte_filer:
  - research/external/r4/DRO-R4-INDEX-2026-06-18.md
  - research/external/r4/DRO-R4-AKTORGATE-MARKORER-2026-06-18.md
  - docs/project/analysis/food-tg-dybdeaudit-jt-fokusfelt-2026-06-18.md
  - research/CITABLE-KNOWLEDGE-BASE-STATUS.md
  - .claude/source-attribution-policy.md
---

# Research runde 5 — dybdeplan for Codex

## 1. Hva dette er, og hvorfor det er arkitekturert slik

Runde 4-kampanjen jobbet A-laget (desk-tettbart) systematisk og fant at den gjenstående avstanden i hovedsak er **B** (aktørgatet) og **C** (epistemisk umulig), ikke mer bredt desk-søk. Denne planen respekterer det taket: den går *dypere* der det faktisk er dyp igjen — primært ved å (a) løfte eksisterende «solide» felt til siterbar primær, og (b) åpne et avgrenset sett nye datasett/temaer der primærkilder finnes. Den jager ikke C, og den kontakter ikke B; begge dokumenteres.

**Tre føringer styrer hvert goal:**

1. **Arkitekturert, ikke bredt.** Hvert goal er knyttet til ett navngitt aspekt + et kildemål. Antallet følger av aspektene. «Alt blir like viktig» er forbudt.
2. **Primærkilde-først.** Hvert datasøk-goal krever primærkilde/datasett og rapporterer tomme celler eksplisitt. Sekundær/NGO holdes som merket estimat utenfor claim-lock.
3. **Dypere kunnskap ≠ siterbar påstand.** Begge er verdifulle; de blandes aldri i mottak. Forståelse re-hentes som primær før den siteres.

## 2. Hvordan Codex skal jobbe (goal-livssyklus)

Hvert goal kjøres som en selvstendig enhet (egen worktree/gren `research/r5-<goal-id>`, ingen push uten vedtak), og er **ikke ferdig før definition-of-done er grønn**:

1. **Les inn:** goal-spesifikasjonen + de navngitte kilde-/korpusfilene.
2. **Utfør:** datasøk (primærkilde-først) ELLER syntese over eksisterende materiale (forståelse).
3. **Lever:** datasøk → `research/external/r5/deep-research-r5-<id>-2026-…md` (pakkeformat: datatabell metrikk|verdi|enhet|år|geografi|metode|kildeeier|URL|locator|datakvalitet + kildeledger + tomme celler). Forståelse → `research/forstaelse/forstaelse-r5-<id>-…md` med «ikke faktastemme»-banner + «må re-hentes som primær»-seksjon.
4. **Verifiser (innebygd):** egen adversariell verifikasjonsagent — URL-spot-sjekk + aritmetikk for datasøk; logisk koherens + evidens-peker-sjekk for forståelse. Flagg primær-vs-sekundær-feilmerking, manglende locator, overclaim, konflasjon.
5. **Mottaksrad:** før `DRO-R5-<id>` i `research/external/r5/DRO-R5-INDEX-…md` (dom, sterkeste kilde, svakeste punkt, claim-effekt, importbeslutning).
6. **Gate (definition-of-done):** for ethvert claim-/flate-berørende goal må relevant gate være grønn før lukking:
   - `npm run audit:citable` og/eller `npm run gate:overclaim`
   - `npm run audit:research-artifacts -- --base=origin/main` for forsknings-binærer/artefakter
   - kode/flate-edits: `npm run lint` + `npm run build` (DB-fri); ved data-import `npm run db:audit` / `db:audit:strict-sources`
   - docs/prosess: `git diff --check`
7. **Oppfølgingsvedtak:** løft status (Solid→Dyp) / marker type B (aktørgate) / lukk som dokumentert C.

**Definition-of-done, kort:** levert i riktig format · adversariell verifikasjon bestått · mottaksrad ført · relevant gate grønn · oppfølgingsvedtak fattet. Ingen goal regnes ferdig på «produsert tekst» alene.

## 3. Goal-katalog (fire temaklynger)

Merking: **[SITERBAR]** = løft eksisterende til primær/claim-lock · **[NY MARK]** = nytt datasett/tema. Hull-type A/B/C som i auditen.

### Klynge A — Fôr/import-aksen

**G-R5-A1 · [SITERBAR] · Norge–Brasil to-motstrøms til claim-lock · A**
Konverter FORST-R4-18 fra forståelse til claim-locked. Re-pull bacalhau/klippfisk HS 0305 fra SSB-08801 (DASK-R4-001, samme PxWeb-metode som D4-16b lyktes med). Hent Scope 3-tall for Brasil-soya i norsk fôr fra selskaps-LCA (Mowi/Skretting/BioMar bærekraftsrapport). *DoD:* SSB-primær HS 0305-serie + Scope 3 med kilde; `gate:overclaim` grønn.

**G-R5-A2 · [SITERBAR] · Konsentrasjon × fôravhengighet til claim-lock · A/B**
Konverter FORST-R4-17. Forsøk uavhengig (Konkurransetilsynet/Menon) tallfesting av fôrmarkedsandeler per produsent (Skretting/Cargill/BioMar/Mowi Feed). Det som ikke finnes uavhengig → marker B (AASK-R4-004), ikke claim. *DoD:* primær eller eksplisitt B-merking; `audit:citable`.

**G-R5-A3 · [NY MARK] · ILUC-dybde via Trase per-eksportør · A/C**
Bygg på D4-11. Hent Trase v2.6 per-eksportør/per-kommune avskogingsallokering for soya til Europa; forsøk å isolere/anslå Norges andel. MapBiomas tidsserie 2015–2024. Tallfest det som kan; dokumentér ILUC-intensitet-for-SPC som C. *DoD:* Trase-primær datatabell + C-notat; verifikasjon av allokeringsmetode.

**G-R5-A4 · [NY MARK] · Alternativprotein i nordisk fôr — aktørledger + skala · A**
Nytt aspekt. Kartlegg nordiske alternativprotein-aktører til fôr (insekt: Innovafeed/Invertapro; mikroprotein/encellet: Solar Foods, Calysta; muslinger; AX Foundation «Framtidens Fisk»): aktør, produkt, faktisk produksjonsvolum/kapasitet, kommersiell status. Primær: Brønnøysund/selskapsrapport/Innovasjon Norge. Skill kapasitet (potensial) fra realisert volum. *DoD:* primær aktørledger; tomme celler eksplisitt.

**G-R5-A5 · [SITERBAR] · Fôr-importavhengighet per kjøttslag · A**
Fullfør det D4-22 åpnet. Hent NIBIO (NO) + Luke (FI) + Jordbruksverket (SE) primærtall for fôr-importandel per kjøttslag (svin/kylling/storfe/laks). *DoD:* primær per land/kjøttslag der publisert; C-merk der ikke; `audit:citable`.

### Klynge B — Sirkularitet/sidestrømmer

**G-R5-B1 · [SITERBAR] · Felles R-stige til claim-lock · A**
Konverter FORST-R4-19. Re-pull SINTEF «Analyse marint restråstoff 2024»-fulltekst (89 %/72 % 2024 var sekundærsitat) + Strand et al. 2024 om tilgjengelig. Kvantifiser høyverdiandel per sidestrøm på primærnivå. *DoD:* SINTEF-primær 2024 + R-stige-tabell; `gate:overclaim`.

**G-R5-B2 · [NY MARK] · Oppdrettsslam nasjonal massebalanse · A/C**
Reelt datagap (D4-19/R3-03). Forsøk Fiskeridirektoratet / Miljødirektoratet / Mattilsynet primær for nasjonal oppdrettsslam-mengde og innsamlingsandel (~2 %?). Hvis ingen nasjonal serie → dokumentér C presist (måleregime mangler). *DoD:* primær eller dokumentert C-funn.

**G-R5-B3 · [SITERBAR] · Nordisk digestat-næringsretur · A/C**
Bygg på D4-23. SE SPCR 120 som mal; forsøk NO (Biogass Norge/Norwaste primær), DK (DST/Energistyrelsen), FI (Luke/Motiva) for realisert N/P/K-retur. Løft det som finnes; C-dokumentér resten. *DoD:* primær per land der publisert; C-funn ellers.

**G-R5-B4 · [NY MARK] · Struvitt/P-gjenvinning realiserte volum · A**
Nytt aspekt. Tallfest faktisk fosforgjenvinning ved norske anlegg (HIAS struvitt, VEAS, Den Magiske Fabrikken): tonn P/år gjenvunnet, Mattilsynet-registrering, faktisk avsetning til jordbruk. Primær: anlegg/miljørapport. Skill kapasitet fra realisert. *DoD:* primær volumtabell; tomme celler eksplisitt.

### Klynge C — Marked/distribusjon

**G-R5-C1 · [SITERBAR] · Nordisk HHI endelig harmonisert + flate-synk · A**
Lukk D4-25/FORST-R4-20-tråden. Fest én primærkilde per land (KT/Konkurrensverket/KFST/KKV/Samkeppniseftirlitið); løs «FI 3662 vs NO 3327»-rangeringen med eksplisitt metodenotat (er kryssnasjonal sammenligning forsvarlig?). Synk casestatus/`citable-acceptance` + sprint-snapshots. *DoD:* `audit:citable` + `gate:overclaim` grønn; `lint`+`build` ved flate-edit.

**G-R5-C2 · [SITERBAR] · Konsentrasjon × food desert til claim-lock · A**
Konverter FORST-R4-20. Re-pull Strøm & Halseth (NHH 2023) fulltekst (metodikk butikkantall-HHI vs omsetnings-HHI), eksakt KT-sidetall for Coops distriktsandel. *DoD:* primær fulltekst-forankring; `gate:overclaim`.

**G-R5-C3 · [SITERBAR] · Offentlig innkjøp × distribusjon til claim-lock · A**
Konverter FORST-R4-21. Re-pull Menon 2024 (ASKO-andel side for side), ny norsk anskaffelseslov 2026 (faktisk lovtekst, ikke bransjemedia), Doffin-kartlegging utover de to dokumenterte. *DoD:* primær lov-/rapportforankring; `audit:citable`.

**G-R5-C4 · [NY MARK] · EMV-andel og leverandørmakt nordisk · A**
Nytt aspekt. Tallfest egne-merkevarer-andel (EMV) per nordisk kjede + kobling til etableringsbarriere for nye leverandører (inkl. sirkulære/alt-protein). Primær: tilsyn/bransje (DLF, Konkurransetilsynet, NielsenIQ merket sekundær). *DoD:* primær der mulig; sekundær merket; kobling levert som strukturhypotese hvis kvalitativ.

### Klynge D — Governance/beredskap

**G-R5-D1 · [SITERBAR] · Governance-ansvarsmatrise til Dyp · A**
Løft D4-12 fra Delvis/Solid til Dyp. Hent Totalberedskapsmeldingen (Meld. St. 9 2024–25) kap. 11 fulltekst, LMD tildelingsbrev for kornberedskapslagring, fylkeskommunens folkehelse-/arealhjemler eksplisitt. *DoD:* hjemmelsforankret matrise; `audit:citable`.

**G-R5-D2 · [SITERBAR] · Nordisk selvforsyning fôr-korrigert · A/C**
Fullfør D4-22. Forsøk SE/DK/FI/IS fôr-korrigert kalorisk selvforsyning fra primærkilde (Jordbruksverket/DST-IFRO/Luke/Hagstofa-Nordregio); der metoden ikke publiseres → C-dokumentér. Harmoniseringsnotat (kolonnene ikke metodisk parallelle). *DoD:* primær per land der finnes; C ellers.

**G-R5-D3 · [NY MARK] · Beredskapslagring nordisk komparativ · A**
Nytt aspekt. Faktiske beredskapslager-volum/-mål for korn og kritiske innsatsvarer (gjødsel/drivstoff til landbruk) per land: NO (Lbdir 82 500 t korn), FI (Huoltovarmuuskeskus/NESA — sterkest tradisjon), SE (beredskapslager gjenoppbygging), DK, IS. Primær: nasjonale beredskapsetater. *DoD:* primær volumtabell; tomme celler eksplisitt.

> **Balanse:** 16 goals = 10 [SITERBAR] (A1, A2, A5, B1, B3, C1, C2, C3, D1, D2) + 6 [NY MARK] (A3, A4, B2, B4, C4, D3). Lett siterbarhets-tyngde, i tråd med «balansert miks». Justér antall ned hvis tid er knapp — SITERBAR-goalsene er lavest risiko og bør gå først.

## 4. Faser (for mange timers kjøring)

- **Fase 0 — Forutsetning:** commit R4-grenen (`commit-r4-dybdekampanje.sh`); kjør DASK-R4-001 (bacalhau HS 0305) som input til G-R5-A1. Re-baseline mot `origin/main`.
- **Fase 1 — SITERBAR (lås gevinstene):** kjør alle [SITERBAR]-goals per klynge. Lav risiko, hever Solid→Dyp og konverterer forståelse→primær. Prosessér + gate per goal.
- **Fase 2 — NY MARK (åpne ny grunn):** kjør [NY MARK]-goals. Bygger på primær-baselinen fra fase 1. Strengere primærkilde-vakt (særlig C4/EMV og A4/alt-protein der sekundærmateriale frister).
- **Fase 3 — Konsolidering + audit-refresh:** re-kjør dybdescore-rubrikken fra auditen mot det nye korpuset; oppdater `research/CITABLE-KNOWLEDGE-BASE-STATUS.md`; kjør `gate:overclaim` + `audit:citable` samlet; skriv DRO-R5-INDEX sluttdom + ny type-B/-C-oversikt.

Kjøreregel: én kjøring per Deep Research-tråd; forståelse og datasøk blandes aldri. Batch → prosessér → gate → neste, ikke alt på én gang.

## 5. Anti-scope-creep- og kvalitetsvakter

1. **Primærkilde-først.** Goal som bare kan svares med sekundær/NGO merkes estimat og holdes ute av claim-lock (særlig A3/ILUC, C4/EMV).
2. **Forståelse ≠ fakta.** Konverterings-goals (A1, A2, B1, C2, C3) er ikke ferdige før det siterte er re-hentet som primær.
3. **Type B forblir gatet.** Ingen aktørkontakt. Det som krever aktør markeres (AASK), ikke fabrikkeres.
4. **Dokumentér C, ikke jag det.** Når et tall ikke finnes offentlig, er leveransen C-notatet, ikke enda et søk.
5. **Wageningen-guardrail.** WUR-score/Moerman aldri som nordisk bevis.
6. **Ikke nye case-numre uten vedtak.** Planen fordyper eksisterende ankre.
7. **Ingen flate-edit uten gate.** casestatus/citable-endringer krever `gate:overclaim`/`audit:citable` grønn + `lint`+`build`.

## 6. Leveranser og spor

- Datasøk → `research/external/r5/` (ID-serie `DRO-R5-<id>`), mottakslogg `DRO-R5-INDEX`.
- Forståelse → `research/forstaelse/forstaelse-r5-<id>-…md`.
- Type-B → oppdatér `DRO-R4-AKTORGATE-MARKORER` (eller R5-ekvivalent).
- Type-C → samle i et `deep-research-r5-datagap-funn`-notat (som D4-26).
- Flate-synk (kun etter gate): casestatus.ts, citable-acceptance, sprint-snapshots.

---

*Neste handling: commit R4 (fase 0), så start fase 1 [SITERBAR]-goals klynge for klynge. Antallet (≈15 goals) er et utgangspunkt arkitekturert rundt de åpne aspektene — det kan vokse hvis fase 1 avdekker flere primær-tettbare hull, men hvert nytt goal må bære samme definition-of-done.*
