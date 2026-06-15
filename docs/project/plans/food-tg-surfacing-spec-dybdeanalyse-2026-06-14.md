---
tittel: Surfacing-spec — dybdeanalyse-funn i plattformen 2026-06-14
status: Forslag til intern bygge-spec
eier: Gabriel
dato: 2026-06-14
scope: Hvordan AP-funnene (AP-1 styreoverlapp, AP-3 tilskuddskonsentrasjon, senere AP-2/4/5..) vises i appen — hvilken flate, hvilke felt, hvordan claim-lock-status rendres — med maksimal gjenbruk av eksisterende komponenter.
bruksregel: Bygge-spec for research/oppsett. Surfacing endrer ikke claim-status: funn vises som intern baseline bak InternalSection til CL-raden er løftet i claim-register. Ingen ekstern faktastemme før operator-sekvensen i research/CITABLE-KNOWLEDGE-BASE-STATUS.md.
relaterte_filer:
  - docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md
  - docs/project/analysis/food-tg-ap3-tilskuddskonsentrasjon-funn-2026-06-14.md
  - docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
  - src/app/innsikt/InnsiktContent.tsx
  - src/components/visualization/EvidenceStatusBadge.tsx
  - src/components/ui/InternalSection.tsx
---

# Surfacing-spec — dybdeanalyse-funn i plattformen

## 1. Hvorfor og hovedgrep

AP-1/AP-3-funnene lever i dag i markdown/JSON og er usynlige i appen. Plattform-dybdeanalysen (11.06) viste at dyp analyse som ikke surfaces, oppleves som grunn. Dette grepet gjør funnene synlige **uten å bygge noe nytt fra bunnen** — appen har allerede alle byggeklossene:

- **`/innsikt`** rendrer allerede innsikter som kort med filterchips, og inneholder en **`LorenzCurveChart`** (AP-3 sin figur er allerede en komponent), pluss `ZipfDistributionChart`, `MarketShareChart`, `FoodFlowSankey`.
- **`EvidenceStatusBadge`** viser datastatus + `citationReadiness` (`citable_external` / `citable_with_note` / `internal_context` / `blocked_unsourced`) — nøyaktig claim-lock-visningen vi trenger.
- **`InternalSection`** gir «🛠 Internt: … — ikke ferdig formidling»-innpakning.
- **`/graf`** kan ta imot AP-1-nettverket som et lagret startmodus.

**Hovedgrep:** legg en **«Dybdeanalyse»-bane på `/innsikt`** (ny `insightType`), ikke en ny topprute. Hvert AP-funn blir én `Insight`-rad. AP-1 får i tillegg en inngang til `/graf` (maktnettverk-modus).

## 2. Hvilken flate

| Alternativ | Vurdering |
|---|---|
| **Bane på `/innsikt` (valgt)** | Gjenbruker Insight-modell, kort, filter, charts, badges. Lavest innsats. Funn der brukeren allerede ser etter innsikt. |
| Ny topprute `/dybdeanalyse` | Mer synlig, men dupliserer rendering og navigasjon. Vurder først når det er ≥5 AP-funn. |
| Kun `/graf` (AP-1) | Riktig for nettverket, men dekker ikke AP-3/tabellfunn. Brukes som *supplement*. |

Konklusjon: én ny `insightType: 'dybdeanalyse'` + filterchip på `/innsikt`, pakket i `InternalSection`. AP-1 lenker til `/graf`.

## 3. Datamodell — hvert funn = én Insight-rad

Bruk eksisterende `Insight`-modell (ingen skjemaendring nødvendig):

| Insight-felt | AP-3-eksempel | AP-1-eksempel |
|---|---|---|
| `id` | `ins-ap3-001` | `ins-ap1-001` |
| `insightType` | `dybdeanalyse` | `dybdeanalyse` |
| `title` | «Produksjonstilskudd: moderat konsentrert, ikke ekstremt» | «Maktnettverket bygger broer i retail/logistikk/foredling» |
| `description` | kort funn §1 | kort funn §1 |
| `source` | «Food Systems 2026 — AP-3» | «Food Systems 2026 — AP-1» |
| `date` | `2026-06-14` | `2026-06-14` |
| `tags` | `[tilskudd, gini, konsentrasjon]` | `[eierskap, maktnettverk, styreoverlapp]` |
| `primaryCitationId` | → SourceCitation m/ `internal_context` | → SourceCitation m/ `internal_context` |
| `sourceRefs` | funnnotat + skript + JSON | funnnotat + JSON + skript |
| `url` | funnnotat-sti | funnnotat-sti |

Tillegg (kan ligge i `tags` eller en liten `metadata`-konvensjon til skjemaet evt. utvides): **dekningsgrad** og **claim-ID** (CL-AP3-001 / CL-AP1-001).

Dataflyt: funnnotatet er kilde til sannhet → en seed-rad legges i `prisma/seed-data` (og fallback i `insights.ts`), committes → `/innsikt` rendrer. Samme mønster som dagens innsikter; build forblir DB-fri.

## 4. Hvilke felt vises på kortet

| Felt | Kilde | Komponent/visning |
|---|---|---|
| Tittel + kort funn | funnnotat §1 | `Card`-tittel + beskrivelse |
| **Claim-lock-status** | CL-rad status + `citationReadiness` | `EvidenceStatusBadge` (status + «Ekstern bruk: intern») + `StatusBadge` «Utkast» |
| Dekning/forbehold | funnnotat dekningsflagg | `CoverageBadge` + én caveat-linje (AP-1: «35,6 % selskapsdekning»; AP-3: «2022–2024 pålitelig; 2024 lukket 2026-06-14 — tidligere «ufullstendig» var en kolonnematch-bug») |
| Figur | SVG/chart | AP-3 → `LorenzCurveChart` (eksisterende); AP-1 → sektorbro-mini + «Se i grafen»-lenke til `/graf` |
| Metode | skript + test | «Metode: reproduserbart skript, enhetstestet» → lenke til `scripts/analyze-*.ts` |
| Kilde/evidens | funnnotat + JSON | `SourceChip`-lenker |
| Stoppspråk | CL-rad «ikke si» | tooltip på badge + skjult linje i InternalSection |

## 5. Hvordan claim-lock-status vises (kjernen)

Claim-lock-status mappes direkte til `EvidenceStatusBadge` sin `citationReadiness`:

| Claim-lock-status (CL-rad) | `citationReadiness` | Badge-tekst | Plassering |
|---|---|---|---|
| `intern baseline` (i dag) | `internal_context` | «Ekstern bruk: intern» | Inne i `InternalSection` |
| Løftet, m/forbehold | `citable_with_note` | «Ekstern bruk: forbehold» | Kan ut av InternalSection |
| Klar | `citable_external` | «Ekstern bruk: citable» | Ekstern flate |
| Blokkert | `blocked_unsourced` | «Ekstern bruk: blokkert» | Skjult eksternt |

Dette betyr at **samme kort viser modningen** fra intern → cite-ready etter hvert som CL-AP3-001/CL-AP1-001 går gjennom primærsjekk og løftes i claim-register. Surfacing-flaten dobler dermed som synlig **claim-trakt** (jf. utviklingsplanens claim-trakt-ønske) — uten en egen ny visning.

I dag står begge funnene på `internal_context`, så de ligger bak `InternalSection` med teksten «🛠 Internt: Dybdeanalyse — ikke ferdig formidling. Tall kan endres.» Ingenting lekker til ekstern flate.

## 6. AP-1 i grafen (supplement)

`/graf` får et lagret startmodus «Maktnettverk (styreoverlapp)» som: filtrerer til selskapene med BoardMember-data, fargelegger noder etter `valueChainStage`, og fremhever de tverrsektorielle bro-personene. Det gjør AP-1 utforskbart, ikke bare en kort-tekst. Dekningsforbeholdet (35,6 %) vises som banner i modusen.

## 7. Governance og rekkefølge

1. Legg `insightType: 'dybdeanalyse'` + filterchip (liten endring i `InnsiktContent.tsx`).
2. Seed `ins-ap3-001` og `ins-ap1-001` fra funnnotatene; koble `primaryCitationId` til en `internal_context`-SourceCitation.
3. Pakk banen i `InternalSection`; koble `EvidenceStatusBadge` til CL-status.
4. AP-3 → `LorenzCurveChart` med decilene fra `ap3-tilskuddskonsentrasjon.json`.
5. AP-1 → sektorbro-mini + `/graf`-modus.
6. Deploy via vanlig main-merge → Coolify. Ingen DB-avhengighet i build.

Når CL-radene løftes i claim-register (etter primærsjekk), flippes `citationReadiness`, og funnet kan forlate `InternalSection` — uten ny kode.

## 8. Innsats og avhengigheter

Lav. Ingen skjemaendring kreves for v1 (bruker `Insight` + `tags`). Mesteparten er konfig + to seed-rader + å koble en eksisterende chart og en eksisterende badge. AP-1-grafmodus er den eneste «nye» biten, og den gjenbruker `/graf`-komponenten. Reproduserbarhet er allerede dekket (skript + enhetstester committet).

## 9. Verifikasjon

Spec'en er bygget mot faktisk kode lest 14.06.2026: `Insight`-modellen i `prisma/schema.prisma`, `InnsiktContent.tsx` (kort, filter, `LorenzCurveChart`, `ZipfDistributionChart`), `EvidenceStatusBadge.tsx` (citationReadiness-nivåer), `StatusBadge.tsx`, `InternalSection.tsx`, og coverage-komponentene. Funn-innholdet er fra `food-tg-ap1-…` og `food-tg-ap3-…funn-2026-06-14.md`. Ingen claim løftes til ekstern bruk av denne spec'en. `git diff --check` forutsettes kjørt før commit.
