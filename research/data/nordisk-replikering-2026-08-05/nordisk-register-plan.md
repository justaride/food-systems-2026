# Nordisk register-replikering — konfigurasjonsplan

> Reconciliation status (2026-08-29): preserved as dated internal research. Claims remain subject to current source, locator, rights, and publication gates. Draft requests are unsent; subscription recommendations do not authorize purchase.

Dato: 2026-08-05. Oppdrag: forberede replikering av MVK-pipelinen (Brreg-basert aktør/styre-import)
til SE/DK/FI/IS. Tilhører gap-program T11 (nordisk MVK-replikering) og T12 (nordisk styre-/eierskapsdekning 14→61).
Ingen kode endret, ingen kontoer opprettet — dette er planen.

## 1. Slik er pipelinen Norge-only i dag

Land/register er **hardkodet**, ikke konfigurert:

| Fil | Norge-binding |
|---|---|
| `scripts/enrich-offentligdata.ts` | `BRREG_BASE_URL = 'https://data.brreg.no/enhetsregisteret/api'` (linje 12); henter `/enheter/{orgnr}`, `/roller`, underenheter for alle NO-selskaper |
| `scripts/extend-board-coverage-brreg.ts` | Samme base-URL (linje 50); `NORWEGIAN_ORGNR_RE = /^\d{9}$/` (linje 56); DELAY_MS 120 |
| `scripts/validate-against-brreg.ts` | Filtrerer på `orgNrFormat=bronnoysund` + numerisk orgNr; ren kjerne er DB-/nett-fri (bra utgangspunkt for gjenbruk) |
| `scripts/import-brreg-financials.ts` | Regnskapsregisteret (norsk) for regnskapstall |
| `src/lib/brreg-roles.ts` | Parser norske rollekoder (LEDE/NEST/MEDL/VARA/DAGL) fra Brreg /roller |
| `src/lib/brreg-board-member-provenance.ts` | `BRREG_ROLES_SOURCE_LABEL`, person-rolle-nøkler |
| `prisma/schema.prisma` | `Company.orgNrFormat String @default("bronnoysund")`, `registrySource`, `country @default("NO")` — felt finnes, så nye formater krever **ingen skjemaendring**, bare nye verdier (`cvr`, `ytj`, `bolagsverket`, `kennitala`) |

Gap-analysens «bare ny konfigurasjon» stemmer delvis: datamodellen er klar, men det finnes ingen
register-adapter-abstraksjon — base-URL, orgnr-regex, rollekode-mapping og rate-limit er inline i hvert skript.

## 2. Tilgangs-realitet per land (verifisert 2026-08-05)

### Danmark — Virk CVR (Erhvervsstyrelsen) ✅ beste kandidat
- **Endepunkt:** `http://distribution.virk.dk/cvr-permanent/virksomhed/_search` (Elasticsearch, verifisert live:
  svarer ES 6.8.23-cluster). Finnes også indekser for produktionsenheter og **deltagere (personer/roller)**.
- **Auth:** gratis, men **krever brukerkonto** — basic auth brukernavn/passord. Verifisert: uten auth → HTTP 401.
  Konto opprettes via Erhvervsstyrelsens selvbetjening (tidligere også via cvrselvbetjening@erst.dk).
  **Menneskegated: kontooppretting må gjøres av eier (vi oppretter ingen kontoer).**
- **Rate limits:** ingen hard publisert grense; fair use + scroll for uttrekk.
- **ID-format:** CVR, 8 siffer.
- **Dataskop:** enhetsdata, status, NACE (DB-koder), adresse, **deltagere med roller (bestyrelse/direktion)** —
  tilsvarer Brreg /roller. Eierandeler: kun «ejerregisteret» for >=5 %-eiere (reelle eiere) via eget register.
- Testobjekter: Salling Group A/S, Coop Danmark A/S, Dagrofa A/S — pluss ISS A/S (CVR 28504799, verifisert)
  som kjent-entitet-kontroll.

### Finland — PRH avoindata (YTJ/BIS) ✅ åpent, ingen nøkkel
- **Endepunkt:** `https://avoindata.prh.fi/opendata-ytj-api/v3/companies?businessId=NNNNNNN-N`
  (verifisert live 2026-08-05 med Kesko 0109862-8 og SOK-oppslag). Dokumentasjon/swagger:
  [avoindata.prh.fi](https://avoindata.prh.fi/en/info/swagger-ui); PRH meldte nye grensesnitt jan 2025
  ([prh.fi](https://www.prh.fi/en/presentation_and_duties/uutislistaus/announcements/2025/open-data-interface.html)).
- **Auth:** ingen. Gratis ([ytj.fi opendata](https://www.ytj.fi/en/index/opendata.html)).
- **ID-format:** Y-tunnus `NNNNNNN-N` (7 siffer + sjekksiffer).
- **Dataskop:** navn, org.form, adresse, TOL/NACE, status; registrerte personer/roller følger med i
  handelsregisterdata i API-et (jf. [businessdataguide 2026](https://www.businessdataguide.com/blog/jurisdictions/finland-company-search-guide)) —
  **bekreft rolledekning mot faktisk respons for SOK/Kesko før adapter skrives.**
- Testobjekter: SOK (0116323-1), Kesko Oyj (0109862-8).

### Sverige — Bolagsverket ⚠️ delvis åpent
- **Gratislaget:** «API för värdefulla datamängder» (EU HVD) — **avgiftsfritt uten avtal**: grunnleggende
  företagsdata, SNI-koder og digitalt inlämnade årsredovisningar
  ([bolagsverket.se/apierochoppnadata](https://bolagsverket.se/apierochoppnadata.2531.html),
  [HVD-API](https://bolagsverket.se/apierochoppnadata/hamtaforetagsinformation/vardefulladatamangder/apiforvardefulladatamangder.5513.html)).
- **Styrelse/roller:** **ikke** i gratislaget — full företagsinformation krever **avtal med Bolagsverket** og er
  avgiftsbelagt. **Menneskegated: avtale + betaling.**
- **ID-format:** organisationsnummer, 10 siffer `NNNNNN-NNNN`.
- **Alternativer uten avtale:** allabolag.se (browsbart, ingen API-lisens), Roaring/BiQ/foretagsapi.se (kommersielle).
- Konsekvens: SE kan dekkes for enhets- og regnskapsdata gratis, men **styrekart for SE er avtalegated** —
  relevant for T12-beslutningen.

### Island — Ríkisskattstjóri fyrirtækjaskrá ⚠️ ingen åpen API
- **Status:** gratis websøk på [skatturinn.is/fyrirtækjaskra](https://www.skatturinn.is) (jf.
  [lookuptax](https://lookuptax.com/docs/tax-identification-number/iceland-tax-id-guide),
  [topograph-guide](https://www.topograph.co/guides/business-registers-in-iceland) — noterer at Island har
  **åpent register over reelle eiere**). Ingen offisiell åpen API funnet.
- **Alternativer:** gagnatorg.ja.is (Jás nasjonalregister-API, lisensiert), companydata.com (kommersiell).
- **ID-format:** kennitala, 10 siffer `DDMMÅÅ-XXXX`.
- Konsekvens: Hagar/Festi dekkes manuelt (årsrapporter på hagar.is/festi.is har topp-10 aksjonærer) —
  lav volum (2 selskaper), ikke verdt adapter i første runde.

### Norsk tilleggsregister (relevant for Task A-oppfølging)
- **Stiftelser:** ligger i Enhetsregisteret (org.form STI) — verifisert med Kavlifondet (938503583).
  Samme åpne API; eget innsyn i Stiftelsesregisteret på brreg.no for vedtekter.
- **Aksjonærregisteret (Skatteetaten):** ikke API — uttrekk per 31.12. kan bestilles av hvem som helst
  (innsynsordning siden 2016). Se `../eierlag-2026-08-05/utkast-innsyn-aksjonarregister.md`.

## 3. Konkret konfigurasjonsplan

### Steg 1 — Register-adapter (refaktor, ~1–2 dager)
Trekk registry-spesifikke deler ut av skriptene bak ett grensesnitt, f.eks. `src/lib/registry/`:
```
type RegistryClient = {
  format: string            // 'bronnoysund' | 'cvr' | 'ytj' | 'bolagsverket' | 'kennitala'
  orgNrPattern: RegExp      // NO /^\d{9}$/, DK /^\d{8}$/, FI /^\d{7}-\d$/, SE /^\d{6}-\d{4}$/
  fetchEntity(id)           // normalisert enhet: navn, orgForm, NACE, status, adresse
  fetchRoles(id)            // normaliserte styre-/lederroller
  rateLimitMs: number
  auth: 'none' | 'basic-env' | 'agreement'
}
```
Endringer: `scripts/enrich-offentligdata.ts`, `scripts/extend-board-coverage-brreg.ts`,
`scripts/validate-against-brreg.ts` tar `--registry=brreg|cvr|ytj` og leser adapter fra config.
`src/lib/brreg-roles.ts` generaliseres: rollekode-tabeller per land
(DK deltager-roller: BESTYRELSE/DIREKTION; FI: PRH rolletyper — verifiser mot live respons).
Nye `orgNrFormat`-verdier settes ved import (`cvr`, `ytj`) — ingen Prisma-migrasjon nødvendig (String-felt),
men `validate-against-brreg.ts`-filteret må akseptere valgt format.

### Steg 2 — DK-adapter + pilot (~2–3 dager, krever CVR-konto)
- Implementer CVR-adapter (basic auth fra env `CVR_API_USER`/`CVR_API_PASS`, `_search`-endepunkt, scroll).
- **Pilot-celle (kandidat-only, jf. T11):** dansk dagligvare — Salling Group A/S, Coop Danmark A/S, Dagrofa A/S
  (+ ISS A/S 28504799 som kjent-kontroll). Dry-run → snapshot JSON i `research/analyse/` → review før eventuell import.
- **Human gate:** eier oppretter gratis CVR API-bruker og legger credentials i lokal `.env`.

### Steg 3 — FI-adapter + pilot (~1–2 dager, ingen gate)
- YTJ/BIS-adapter (ingen auth). Pilot: SOK (0116323-1) + Kesko (0109862-8). Først verifisere at
  rolle-/persondata faktisk er med i v3-responsen — hvis ikke, dokumenter dekning som «enhet only» og
  vurder virre-tjenesten (betalt) for roller.

### Steg 4 — SE beslutningspunkt
- Enheter + årsrapporter: gratis HVD-API (~1 dag). **Styre: avtalegated** — beslutning om Bolagsverket-avtale
  (budsjett) eller kommersiell kilde. Parkeres til eier tar stilling; inntil da: enhetsnivå + manuelle
  årsrapportoppslag for ICA/Axel Johnson/Cheffelo.

### Steg 5 — IS manuelt spor
- Hagar + Festi: årlig manuell kuratering fra årsrapporter (hagar.is/festi.is IR) — ingen adapter.

## 4. Estimat og gates samlet

| Land | Data | Auth/kostnad | Estimert arbeid | Human gate |
|---|---|---|---|---|
| DK | Enheter + roller | Gratis konto (basic auth) | 2–3 dgr inkl. pilot | Kontooppretting (eier) |
| FI | Enheter (+roller?) | Ingen | 1–2 dgr inkl. pilot | Ingen — bare verifiser rolledekning |
| SE | Enheter + årsrapporter | Gratis (HVD) | ~1 dag | — |
| SE | Styre/roller | Avtale + avgift | +1 dag etter avtale | Avtale/budsjett (eier) |
| IS | Kun websøk/årsrapporter | Gratis, manuelt | 2 selskaper × årlig kuratering | — |

Anbefalt rekkefølge: **DK-pilot først** (beste datadekning per innsats, matcher T11s «én celle per land»),
deretter FI (gratis, ingen gate), SE enhetsnivå, IS manuelt. Alt kjøres `--dry-run` med snapshot-review før
eventuell DB-import, i tråd med pipelinens eksisterende claim-disiplin.
