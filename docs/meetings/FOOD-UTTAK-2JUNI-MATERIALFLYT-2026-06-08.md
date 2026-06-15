# Food-uttak fra 2. juni-møtet — materialflyt videre

**Dato:** 2026-06-08
**Formål:** Trekke ut det som er konkret relevant for Food fra møtet 2. juni 2026, slik at vi har styrbare elementer for å ta prosjektet videre fra vår side.
**Møtet:** «Circle City Life — Gjennomgang av materialstrøm-Sankey og datakvalitet», 2. juni 2026.
**Deltakere:** Jan Thomas Ødegard, Cathrine Barth, Gabriel Freeman (alle tre — siste møte med både Cathrine og JT).
**Hvorfor det ligger på Cities-siden:** Møtet er logget i Cities-repoet (`src/lib/data/meetings.ts`, `meeting-5`, kilde `src-21`). Råtranskripsjon: `~/Downloads/optimalisert_transkripsjon_kvalitetssikret.docx` (~17 min, språkvasket, degradert etter 17:00). Cities-analyse: `Circular Cities 2026/research/synthesis/meeting-analysis-2026-06-02-jan-thomas-cathrine-gabriel.md`.

> **Avgrensning:** Dette er et internt uttaksnotat. Ingen kildefiler endret. Ingen utadrettet kontakt — finansierings-, konsortie- og intervjuspor er registrert som intern forberedelse; selve oppfølgingen er eierstyrt.

---

## 1. Hvorfor møtet er relevant for Food

Møtet var rammet inn som et Cities-møte (deres material-Sankey), men det er **samme materialflyt-metode Food rullet ut i Materialflyt-fanen på `/sirkularitet` (02.06)** — og hele teamet var i rommet. Forbeholdene og analysegrepene JT/Cathrine landet gjelder derfor 1:1 for Food-Sankey-en, og flere tråder svarer direkte på åpne Food-spørsmål fra Møte 7/8/9.

---

## 2. Hva Food-Sankey-en allerede har (ikke gjør på nytt)

Verifisert i koden (`src/components/charts/FoodFlowSankey.tsx`, `MaterialFlowTab.tsx`, `FoodFlowMap.tsx`, `src/components/visualization/StatusLegend.tsx`):

- **Evidensgradering** per strøm: `observed / estimated / proxy / illustrative`.
- **«Indeks, ikke tonn»** og **«Sankey viser kun kvantifiserte strømmer»** står som forbehold.
- **StatusLegend** med bl.a. «Illustrativ».

Dvs. records-≠-volum-disiplinen er **delvis** på plass. Det møtet legger til er tre grep vi *ikke* har eksplisitt ennå: verdikjede-akse, formåls-/handlingssone-ramme, og kilde≠strøm-legende.

---

## 3. Tre plattformgrep — spesifisert nok til å bygge

### 3.1 Formålsavsnitt: «hva mangler = handlingssonen» *(nytt)*

JTs viktigste poeng: det interessante er ikke hva som *er* der, men hva som **mangler / er ubearbeidet** — «der kommer vi til handlingssonen». For Food svarer dette rett på Møte 8s åpne spørsmål *«hvor er de største gapene i matsystemet?»*.

- **Hvor:** topp av materialflyt-fanen (`MaterialFlowTab.tsx`, montert i `src/app/sirkularitet/SirkularitetContent.tsx`).
- **Utkast:** «Denne Sankey-en er et røntgenbilde av matsystemets registrerte materialstrømmer fra åpne kilder. Den sier ikke hvor mye (volum) eller hvor verdifullt (verdi) noe er. Den viktigste lesningen er ikke hva som er der, men hva som mangler eller er ubearbeidet — det peker mot handlingssonen: hvilke sidestrømmer bør utnyttes, bearbeides eller jobbes videre med.»

### 3.2 Verdikjede-akse per strøm: råstoff/bearbeidet · oppstrøm/avfallsside *(nytt — høyest verdi)*

Møtets mest konkrete nye analyseprodukt, og det er nøyaktig Food sitt anker fra Møte 6/8 (import/domestic → prosessering → grossist → retail/HORECA → avfall).

- **Datamodell:** annotér hver strøm/kant med to felt — `stage: 'raastoff' | 'bearbeidet'` og `position: 'oppstroem' | 'avfallsside'`.
- **Flate:** la dem stå som filter/badge i inspektøren, slik at en strøm kan leses etter *hvor i materialreisen den sitter* uten å påstå volum/verdi.
- **Effekt:** gjør Sankey-en styrbar og kobler den til R-stige/sirkularitetsvurderingen per ledd.

### 3.3 «Registrert = kilde, ikke målt strøm»-legende *(nytt)*

Cathrine var usikker på hva «registrert» betyr (kilde vs. faktisk strøm). Samme forvirring vil treffe Food-lesere.

- **Hvor:** ved siden av `StatusLegend` på materialflyt-fanen.
- **Tekst:** «Registrert = en kilde/dokument som omtaler strømmen, ikke en målt materialbevegelse. Sektorene indikerer hvor man bør lete videre.»

---

## 4. Prioritert backlog (#4–#8) — analyse/forberedelse

| # | Element | Kobling i Food | Avhengighet |
|---|---|---|---|
| 4 | **Output-/avfallssiden — bygg ut fra Kalundborg.** Kartlegg hvor norsk matavfall/sidestrøm går (biogass, biorest, fôr) for én case. | Kalundborg-loopen finnes alt i Materialflyt-fanen (`/sirkularitet`) + romlig på `/kart/[land]/flow`; Møte 7 (biogass/biorest/mikroplast, svartvann/Helsingborg, ~70 % fôrineffektivitet) | Løs |
| 5 | **«Matsystemet som materiallager».** Hvilke akkumulerte sidestrømmer/næringsstoffer kan «mines» — okara/BSG, marint restråstoff, husdyrgjødsel/nutrient loops? Merk som modellert/scenario. | = kandidatstrømmene i valideringssprinten (Møte 9 F3) | Løs |
| 6 | **Finansieringskrok: ~27 mill. samfunnsoppdrag om sirkulære symbioser** (Nordic Innovation / Nordisk ministerråd). Ta Food med i desk-kartlegging (organ, frist, krav). | Svarer på Møte 8: «carrot» for Food-aktører; sirkulære symbioser = sidestrøm/fôr/nutrient loops, Kalundborg som showcase | Hold adskilt fra metodikkvalg; ikke bygg konsortium ennå |
| 7 | **Design dybdeintervju-guide.** Fasen skifter fra drøfting → dybdeintervjuer. Design (ikke gjennomføring) kan starte; deles på tvers av Cities/Food. | Møte 8 ringrunde (Cathrine: intervjuguide + Fødevareklyngen/NMBU; JT: Foodstudio) | Gjennomføring gated på scope/eier |
| 8 | **Materialforsker-/fagvalidering som forutsetning** for ekstern troverdighet. | Binder på valideringssprinten + «ikke eksternt validert»-status | Løs |

---

## 5. To uavklarte beslutninger som også angår Food

1. **DK/NO-kildeavviket — signal eller artefakt?** Food har samme nordiske dekningsspørsmål (coverage/overclaim-audit fra 02.06). Trenger en kort forklaringsboks: kildeantall ≠ materialmengde ≠ sirkularitetsnivå.
2. **Granulering — hvilke 1–2 strømmer forfølges dypere?** Forslag: matsvinnkvalitet først (jf. Møte 9), deretter okara/BSG eller marint restråstoff.

---

## 6. Kobling til eksisterende Food-arbeid

- **Plattform:** `src/components/charts/{FoodFlowSankey,MaterialFlowTab}.tsx`, `src/app/sirkularitet/SirkularitetContent.tsx`, `src/components/visualization/StatusLegend.tsx`.
- **Møtekontekst:** `docs/meetings/MØTEOVERSIKT.md` (Møte 6/8/9), `docs/meetings/GAP-NYESTE-MOTER-2026-06-08.md`, `docs/meetings/food-tg-oppdatering-2026-06-02.html`.
- **Valideringssprint / metode:** `docs/project/mandates/claim-register-food-tg.md`, Møte 9 F3.

---

*Neste steg: bygg #3.1–#3.3 via spec→PR (lav avhengighet av scope-vedtak). #6 (finansiering) er den raskeste «carrot»-en å konkretisere på Food-siden.*
