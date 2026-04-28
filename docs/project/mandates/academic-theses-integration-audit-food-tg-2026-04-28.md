---
tittel: "Academic theses integration audit - Food TG"
status: Utført internt
eier: Gabriel / Codex
dato: 2026-04-28
neste_handling: "Koble documentId for prioriterte avhandlinger og lukk reelle PDF-hull."
relaterte_filer:
  - research/bibliotek/akademia/nordisk-avhandlingsregister.md
  - research/bibliotek/akademia/masteroppgaver/
  - src/lib/data/theses.ts
  - research/PLATTFORM-KOBLING.md
  - research/KI-PRIORITY.md
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/evidence-matrix-food-tg.md
  - docs/project/mandates/thesis-db-linkage-cleanup-food-tg-2026-04-28.md
  - docs/project/mandates/research-synthesis-food-tg-v0.1.md
---

# Academic theses integration audit - Food TG

## 1. Kort konklusjon

Vi har **studert og syntetisert avhandlingene i betydelig grad**, men vi har bare delvis tatt dem videre inn i Food TGs operative evidence-/claim-struktur.

Status per 2026-04-28:

| Lag | Status | Vurdering |
|---|---:|---|
| Nordisk register | 70 master/PhD i `nordisk-avhandlingsregister.md` | God bruttoliste og tematisk dekning. |
| Lokale thesis-notater | 74 filer i `research/bibliotek/akademia/masteroppgaver/` | Godt som kunnskapsbibliotek; de fleste har metode/relevans, men ujevn mal. |
| App/DB-struktur | 79 Thesis-rader i Prisma etter duplikatsletting, 64 master + 15 PhD | Sterk strukturert oversikt; de 7 svake `thesis-food-*` importduplikatene er slettet 2026-04-28. |
| Dokumentkobling | 64 av 79 Thesis-rader har `documentId` | Brukbart, men 15 bør kobles eller lukkes som reelle hull. |
| Syntesefelt | 79/79 har `synthesis`, `keyFindings`, `takeaways` og `method` | De svake partial-importene er fjernet. |
| Food TG evidence matrix | 15 thesis/PhD-kilder er eksplisitt promotert til EV-rader etter fortsettelsen 2026-04-28 | Hovedgapet er redusert: corpus er nå bedre omsatt til claims, men dokumentkobling og ekstern validering gjenstår. |

Arbeidsdiagnose: Avhandlingene fungerer godt som **Akademia-/bibliotekslag**, men bare noen få er blitt **beslutningsklare Food TG-kilder**. Neste steg er derfor ikke mer bred innsamling, men promotering av utvalgte avhandlinger til source cards, EV-rader, claim-koblinger og valideringsspørsmål.

## 2. Hva som allerede er trukket ut

Det finnes tre tydelige nivåer av uttrekk.

### A. Bibliotek- og oversiktsnivå

`research/bibliotek/akademia/nordisk-avhandlingsregister.md` samler 70 avhandlinger fra 2006-2026 og fordeler dem tematisk:

| Tema | Antall i register |
|---|---:|
| Konkurranse og markedsstruktur | 24 |
| Matsvinn | 15 |
| Beredskap og selvforsyning | 8 |
| Digital og e-handel | 7 |
| Offentlig innkjøp og politikk | 4 |
| Regulering og matpolitikk | 3 |
| Klima og proteinskifte | 3 |
| Verdikjede | 2 |
| Atferd og forbrukere | 2 |
| Sirkulærøkonomi | 2 |

Dette gir god dekning av Food TGs bakgrunnsspørsmål, men registeret er en bruttoliste og ikke alene en claim-matrise.

### B. Syntese- og appnivå

`src/lib/data/theses.ts` og live Prisma inneholder app-klare Thesis-poster med:

- tittel, år, institusjon, grad og URL
- `synthesis`
- `keyFindings`
- `takeaways`
- `method`
- tags for tema som `matsvinn`, `sirkulaer`, `offentlig-innkjop`, `beredskap`, `verdikjede`, `konsentrasjon`, `makt`, `prising`

Live DB etter duplikatrydding 2026-04-28:

| Metrikk | Antall |
|---|---:|
| Thesis-rader totalt | 79 |
| Master | 64 |
| PhD | 15 |
| Med `documentId` | 64 |
| Uten `documentId` | 15 |
| Med `synthesis` | 79 |
| Med `keyFindings` | 79 |
| Med `takeaways` | 79 |
| Med `method` | 79 |

Dette betyr at **majoriteten er lest på sammendrags-/analysenivå** og allerede er strukturert nok til å bli brukt i appen.

### C. Food TG evidence-/claim-nivå

Ved første audit var bare disse avhandlingene eksplisitt løftet inn som EV-rader:

| EV-ID | Kilde | Bruk |
|---|---|---|
| EV-B-004 | `eriksson-phd-2015.md` | Matsvinn i svenske supermarkeder; ferskvarer, forebygging, donasjon/biogass. |
| EV-B-005 | `albizzati-phd-2021.md` | LCA/kaskade for matsvinnshåndtering; redistribusjon og dyrefôr før lavere verdi. |
| EV-C-010 | `lehtokunnas-phd-2023.md` | Sirkulærøkonomi som praksis i butikk, husholdning og biogassanlegg. |

Dette var for lite gitt corpusets størrelse og relevans.

Etter fortsettelsen 2026-04-28 er følgende akademiske kilder i tillegg promotert til source cards, EV-rader og claim-koblinger:

| EV-ID | Kilde | Bruk |
|---|---|---|
| EV-B-021 | Hebrok 2020 | Matsvinn som hverdagspraksis; svekker informasjonstiltak alene og styrker adoption-design. |
| EV-B-022 | Brancoli 2021 | Brødverdikjede, take-back-avtaler og insentiver for overproduksjon/upcycling. |
| EV-B-023 | Sundin 2024 | Matsvinnforebygging og klimaeffekt; brukes som overclaiming-brems. |
| EV-B-024 | SLU house crickets 2025 | A/B-forskningscase for insektprotein, crop residues og frass/næringsstoffløkke. |
| EV-C-018 | Sørensen 2016 | Offentlig kjøkkenomlegging og innkjøp som adoption-mekanisme. |
| EV-C-019 | Lindström 2021 | Grønn offentlig anskaffelse, organisk marked og pris-/etterspørselsmekanismer. |
| EV-C-020 | Sundqvist 2025 | Emballasje, circular governance og mattrygghet som policy-labyrint. |
| EV-C-021 | Halseth 2024 | Norsk dagligvarestruktur og lokale konkurranseeffekter. |
| EV-C-022 | Ulsaker 2016 | Vertikale restriksjoner, pris, assortiment og profitfordeling. |
| EV-C-023 | Nguyen & Hartmann 2024 | Restriktive eiendomsklausuler og etableringsbarrierer i norsk dagligvare. |
| EV-C-024 | Martens & Norum 2020 | Importvern, leverandørkonsentrasjon og bro mellom A og C. |
| EV-C-025 | Skjervheim, Bernes & Flo 2016 | Distribusjonskontroll og logistikk som adoption-/scaling-gate. |
| EV-ACT-005 | p49 PhD-prosjekter Norden | Uvalidert research-front/contact-list for videre primærsjekk, ikke effektbevis. |

## 3. Relevans mot dagens Food TG-scope

Runde-4-syntesen peker mot **Spor A + Spor B, med Spor C som adoption-/regelverks-/datagate**. Avhandlingene støtter dette slik:

| Spor | Dekning i avhandlingene | Vurdering |
|---|---|---|
| A - fôr/import/sporbarhet | Svak/moderat direkte dekning | Trenger særlig Foods of Norway, pågående PhD/prosjektkart og nye proteiner; selve thesis-laget er sterkere på marked/adoption enn fôrråvarer. |
| B - sidestrømmer/matsvinn/nutrient loops | Sterk dekning | Eriksson, Albizzati, Hebrok, Brancoli, Sundin, Sturen, Mattila, Makela, Hagan, Storm/Teigland m.fl. er direkte relevante. |
| C - adoption/governance/data/marked | Sterk dekning | Lehtokunnas, Sundqvist, Sørensen, Lindström, Stein, Stahl og NHH/BECCLE-markedsmaktarbeid gir sterk adoption-gate. |
| Baseline/markedsmakt | Svært sterk dekning | NHH/UiB/Nordic theses dekker konsentrasjon, eiendom, importvern, vertikale avtaler, EMV, pricing og konkurranse. Dette bør brukes som forklaring på adoption-barrierer, ikke som eget hovedspor. |

## 4. PhD-status

PhD-laget er særlig viktig fordi det har høyere evidensvekt enn masteroppgavene. Live DB har 15 PhD-rader.

| PhD | Relevans | Status |
|---|---|---|
| Eriksson 2015 | B/C: supermarket food waste, kaskade | I evidence matrix. |
| Albizzati 2021 | B: LCA av matsvinnshåndtering | I evidence matrix, men mangler `documentId`. |
| Lehtokunnas 2023 | C/B: sirkulærøkonomi som praksis | I evidence matrix. |
| Hebrok 2020 | B/C: husholdningsmatsvinn, praksisteori | Promotert til EV-B-021. |
| Brancoli 2021 | B: surplus bread, supplier-retailer interface | Promotert til EV-B-022. |
| Sundin 2024 | B/C: food waste prevention og forbruk | Promotert til EV-B-023. |
| Sundqvist 2025 | C/B: governance maze for packaging/circularity | Promotert til EV-C-020. |
| Sørensen 2016 | C: organic public procurement/public kitchens | Promotert til EV-C-018. |
| Lindström 2021 | C: green public procurement and organic food | Promotert til EV-C-019. |
| Stein 2022 | C: sustainable food procurement UK vs DK/SE | Studert/lokal PDF, ikke EV-promotert. |
| Ulsaker 2016/2018 | C/market gate: vertical restraints, grocery competition | Promotert til EV-C-022. |
| Halseth 2024 | C/market gate: Coop/ICA acquisition and format competition | Promotert til EV-C-021. |
| Rey & Vergé 2005 | C/market theory: vertical restraints | Studert/PDF, men bør være teori-/bakgrunnskilde. |
| SLU house crickets 2025 | A/B: circular protein/frass | Promotert til EV-B-024, men mangler fortsatt lokal PDF-/dokumentspeiling. |

## 5. Datakvalitets- og strukturavvik

### 5.1 DB/import-drift

Det er avvik mellom statisk seed og live DB:

- `src/lib/data/theses.ts`: 78 Thesis-poster.
- Live Prisma etter duplikatrydding: 79 Thesis-poster.
- `research/KI-PRIORITY.md`: 78 thesis-poster i prioriteringsgrunnlaget.

Dette tyder på at senere importer tidligere la til ekstra Thesis-rader uten at seedfil og KI-prioritering var fullt samkjørt. De 7 kjente `thesis-food-*` partial-importene ble slettet 2026-04-28.

### 5.2 Partial-importerte duplikater

Disse 7 `thesis-food-*` radene hadde `synthesis`, men manglet `keyFindings`, `takeaways` og `method`. De ble slettet fra Prisma 2026-04-28 etter guard-sjekk:

| ID | Trolig overlapper |
|---|---|
| `thesis-food-67557def0cdf` | `simonsen-2017` |
| `thesis-food-bef4051e02de` | `morken-2015` |
| `thesis-food-5c1b2fbf7c82` | `sedwall-2025` |
| `thesis-food-3a4005a27bf6` | `esposito-2022` |
| `thesis-food-7a19be6dbec1` | `sorensen-phd-2016` |
| `thesis-food-49a5e899db68` | `brancoli-phd-2021` |
| `thesis-food-28bf4892a6a2` | `jorgensen-ahmadi-2024` |

Status: slettet. Canonical thesis-ID beholdes.

### 5.3 Dokumentkobling

15 Thesis-rader mangler `documentId`. Noen har likevel lokal fil i `arkiv-sortert` eller `evidence-pack`, men koblingen er ikke normalisert.

Viktigste å fikse først:

| ID | Hvorfor |
|---|---|
| `albizzati-phd-2021` | Allerede EV-B-005; bør ha dokumentkobling. |
| `sedwall-2025` | Logistikk/verdikjede, relevant for B/C. |
| `slu-house-crickets-2025` | Relevant for A/B, men svak dokumentstatus. |
| `sundqvist-phd-2025` | Har dokumentkobling i DB, men bare summary/lokal arkivstatus bør kontrolleres før tung bruk. |
| `barbakken-hausken-2006`, `kronqvist-2010`, `steien-2016`, `storm-teigland-2017`, `schuler-2017` | Nyttige, men ikke nødvendigvis kritiske for første Food TG-scope. |

## 6. Hva som bør promoteres til Food TG-oversikten

Extraction-pass 2026-04-28 har laget source cards/EV-rader for prioriterte avhandlinger. Tabellen under viser hva som ble løftet først, og hva som fortsatt er valideringsstatus.

### Prioritet 1 - direkte B/C-evidens

| Kilde | Hvorfor |
|---|---|
| Hebrok 2020 | Promotert til SRC-B-028 / EV-B-021. |
| Brancoli 2021 | Promotert til SRC-B-029 / EV-B-022. |
| Sundin 2024 | Promotert til SRC-B-030 / EV-B-023. |
| Sørensen 2016 | Promotert til SRC-C-019 / EV-C-018. |
| Lindström 2021 | Promotert til SRC-C-020 / EV-C-019. |
| Sundqvist 2025 | Promotert til SRC-C-021 / EV-C-020. |

### Prioritet 2 - markedsmakt som adoption-gate

| Kilde | Hvorfor |
|---|---|
| Halseth 2024 | Promotert til SRC-C-022 / EV-C-021. |
| Ulsaker 2016/2018 | Promotert til SRC-C-023 / EV-C-022. |
| Nguyen & Hartmann 2024 | Promotert til SRC-C-024 / EV-C-023. |
| Martens & Norum 2020 | Promotert til SRC-C-025 / EV-C-024. |
| Skjervheim/Flo 2016 | Promotert til SRC-C-026 / EV-C-025. |

### Prioritet 3 - A/B-prosjektfront og nye proteiner

| Kilde | Hvorfor |
|---|---|
| SLU house crickets 2025 | Promotert til SRC-B-031 / EV-B-024; dokumentkobling og PDF-sjekk gjenstår. |
| `p49-phd-prosjekter-norden-2026-04-20.md` | Promotert til SRC-ACT-005 / EV-ACT-005 som uvalidert research-front/contact-list. |
| Foods of Norway/NMBU-notater | Mer direkte A-feed enn de fleste masteroppgaver. |

## 7. Anbefalt arbeidsrekkefølge

1. Ferdig 2026-04-28: Rydd `thesis-food-*` duplikatene i Prisma.
2. Koble `documentId` for prioriterte avhandlinger som allerede har lokal PDF/MD.
3. Ferdig 2026-04-28: Lag 12-15 source cards med samme mal som `underlagsgjennomgang`.
4. Ferdig 2026-04-28: Legg nye EV-rader inn i `evidence-matrix-food-tg.md`.
5. Ferdig 2026-04-28: Koble EV-radene til `claim-register-food-tg.md`, særlig `CL-B-009`, `CL-B-021`, `CL-B-022`, `CL-C-001`, `CL-C-002`, `CL-C-014`, `CL-C-015`.
6. Fortsatt: Marker alle PhD-/masterfunn med status: `bruk`, `sjekk`, `valider`, `bakgrunn` der de tas inn i briefs/outreach.
7. Fortsatt: Bruk avhandlingene som sekundært beslutningsgrunnlag i actor outreach, men ikke som erstatning for aktørvalidering eller primærdata.

## 8. Beslutning for prosjektet

Avhandlingene bør ikke behandles som et eget bredt research-spor videre. De bør brukes som **evidensbank** for tre konkrete funksjoner:

1. **B-sporet:** kaskade, matsvinnkvalitet, sidestrømmer og praktisk håndtering.
2. **C-sporet:** adoption, offentlig innkjøp, governance, markedskonsentrasjon og datakrav.
3. **A-sporet:** begrenset støtte via nye proteiner/fôr og pågående forskningsprosjekter; her trengs mer primærdata og aktørkontakt enn thesis-lesing.

Med andre ord: Vi har nok akademisk materiale, og første flytting fra bibliotek til beslutningsstruktur er gjort. Det som gjenstår er dokumentkobling, reelle PDF-hull og ekstern/primær validering av de claimene som skal brukes utad.
