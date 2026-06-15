# Klarhet- og intuitivitet-audit — alle sider

**Dato:** 2026-06-08
**Omfang:** Alle ~47 ruter under `src/app/`, vurdert mot ett fast skjema.
**Bestilt av:** Gabriel — «gå metodisk gjennom sidene … prosjektet må være mer intuitivt å forstå.»
**Målgruppe-beslutning:** Appen skal tjene **både** internt team (Food TG — styring, kildekontroll, datakvalitet) **og** eksterne lesere — med et **tydelig skille** mellom intern arbeidsflate og formidling. Det skillet er gjort til en egen vurderingsdimensjon (C).

Utløst av: «Dekningsoversikt»-boksen med «0% verifisert» — uklart hva det betyr. Auditen bekrefter at dette ikke er et enkeltstående problem, men det mest synlige eksempelet på fem systemiske mønstre.

---

## 1. Diagnose (kort)

Appen blander i praksis **to produkter i samme visninger**: et internt arbeids-/QA-verktøy (datakvalitet-score, backlog, kuratorstatuser, påvirkningsdata) og en formidlingsflate for eksterne. Et godt innrammings-system finnes allerede (`PageFraming` + `StatusLegend` + forbehold-bokser), men det brukes **bare på ~7 av 47 sider**. Der det mangler, lekker interne koder, farger og sjargong rett inn i leservendte sider uten forklaring.

Konsekvensen for en nykommer: koder som ser ut som dommer eller feil («0% verifisert» rødt, «Blokkert», «Score 3/10», «Opposed»), engelsk/teknisk stammespråk, og ingen måte å vite hva som er ferdig formidling vs. arbeid under utvikling.

**Godt nytt:** «mer intuitivt» krever lite ny funksjonalitet. Det handler mest om å **bruke eksisterende mønstre konsekvent** + rette noen villedende tilstander. Lav risiko, høy effekt.

---

## 2. Systemiske mønstre (rotårsaker)

### M1 — Intern/ekstern-skillet mangler (alvorligst, treffer målgruppe-beslutningen direkte)
Interne arbeidsflater rendres inline i leservendte sider uten markør. **6 sider har null skille** (`/kilder`, `/aktorer`, `/aktorer/[slug]`, `/eierskap`, `/verdikjede`, `/forskningsrunder`); ~18 til er «delvis».
- Verst: `/kilder` (hele siden er kurasjon: backlog, nedlastingsstatus, CSV-stier, «promotert til SourceDoc») under H1 «Kunnskapsgrunnlag».
- Sensitivt: `/aktorer` merker navngitte eksterne aktører «Opposed/Skeptical», med interne «asks» og «Ønsket stance» synlig.
- **Forbilder å kopiere:** `/bibliotek`, `/graf`, `/mandat`, `/sammenligning`, `/styremedlemmer`, `/masteroppgaver` — alle bruker `PageFraming` + `StatusLegend` + forbehold.

### M2 — Villedende tomtilstander («0/0 = 0%»)  ← det du pekte på
«0% verifisert» betyr egentlig «andel rader et menneske har kvalitetssjekket». Men:
- 3 av 5 datasett i boksen har **0 rader totalt** → «0% verifisert» er `0/0` = «ikke sporet», men ser **identisk** ut (rødt) som `produksjonstilskudd` med 179 311 reelt ukontrollerte rader.
- Forklaringsavsnittet finnes **kun** på `/hvitbok/proveniens`, ikke på `/kilder` der samme boks også vises.
- Samme felle igjen: `/subsidier` dekning-brøker («Foretaksnavn 37/100»), `/mandat` «0 claims», `/media` «Arbeidsklar/Tynn/Mangler», `/produsenter` «—» i tre betydninger.
- Kilde: `src/lib/coverage/badge-model.ts:28-33`, data i `public/data/coverage/profiles.json`.

### M3 — Badge-farger uten legende + «rødt = feil»-antimønster
En god `StatusLegend`-komponent finnes, men vises bare på `/sok`, `/mandat`, `/bibliotek`, `/graf`, `/sammenligning`. Ellers: titalls fargekodede badge-systemer uten nøkkel (typefarger `/sok`, rollefarger `/team`, kontrollstatuser `/mandat`, stance `/aktorer`, researchstatus `/sammenligning`, citation `/selskap/[id]`, tema-farger `/masteroppgaver`).
**Rødt brukes til ikke-feil** gjentatte ganger: «0% verifisert», språkbadge «NO» (`/metodikk/prompts`), «Selvleie» (`/eiendommer`), «Blokkert»/«Siterbar med forbehold» (`/selskap/[id]`, citation), lav «Score» (`/eierskap`). Leseren tolker rødt som «noe er galt».

### M4 — Engelsk/intern sjargong i ellers norsk UI
Lekker inn uten forklaring: *Evidence Pack, Ten Step, Core KPIs, Stop signals, C-gate, Needs primary-check, Interlock, Commitment Snapshot, Specific ask, FTS, Exa, SourceDoc, backlog, staging, Food TG, transition group, Champion/Supportive/Opposed, P1/P2/P3, YoY, MTB, EMV, EPR/PPWR.* Forklaringene finnes til dels i forsidens `Nøkkelbegreper` og `/innsikt`-glossaret — men begge er **kollapset** og dekker **ikke** badge-/statuskodene som forvirrer mest.

### M5 — Rå DB-/dev-artefakter eksponert for leser
Feltnavn (`buyerId`, `producerId`, `documentId`, `operatingResult`, «PersonProfile-tabellen», `BusinessRelationship`), filstier (`research/evidence-pack/…`, `DATA-SOURCES.md`), kommandoer (`npm run db:import:produksjonstilskudd` vises i en tom-tilstand på `/subsidier`), «via offentligdata MCP», `schemaVersion`. Dette hører hjemme i kode/dokumentasjon, ikke i UI.

### M6 — Manglende æøå (mojibake) — eget, mekanisk problem
Ser direkte uferdig ut: «Moter», «nokkelpersoner», «Apne», «Operativ ko», «Soknader og nokkelhendelsr», «Avslatt», «Omrade», «Mal», «Ar», «soket». Trolig en enkelt encoding-/datakilde-feil; bør spores og rettes samlet.

### M7 — Manglende formål ved første blikk
Enkelte sider mangler «hva er dette / hvem er det for» på ~5 sek: `/kart/[country]` (kun `sr-only`-tittel), `/verdikjede`, `/tidslinje` (tittel «Tidslinje» men innholdet er søknadskort uten tidsakse).

---

## 3. Prioritert tiltaksliste

### P0 — Systemisk fundament (gjør disse først; alt annet henger på dem)
1. **Innfør ett konsistent intern/ekstern-skille.** Etabler en gjenbrukbar «Intern arbeidsflate»-ramme (utvid `PageFraming`) og bruk den på alle sider/seksjoner som er kurasjon/QA/påvirkning. Rull ut på de 6 «nei»-sidene først: `/kilder`, `/aktorer`(+detalj), `/eierskap`, `/verdikjede`, `/forskningsrunder`.
2. **Fiks 0/0-villedningen.** I `badge-model.ts`: når `total === 0`, rendre et nøytralt merke «ikke sporet / —» i stedet for rødt «0% verifisert». Definér «verifisert» i én setning.
3. **Vis dekning-forklaringen der boksen faktisk står.** Flytt/gjenbruk proveniens-avsnittet på `/kilder` (eller skjul boksen der). I dag finnes legenden kun på `/hvitbok/proveniens`.

### P1 — Høy effekt, lav innsats
4. **Global badge-/status-legende.** Gjør `StatusLegend` (eller en utvidet «(?)»-popover) tilgjengelig overalt badges vises; dekk stance, prioritet (P1–P3), researchstatus, citation, coverage, datakvalitet-score.
5. **Fjern «rødt = feil» der det ikke er feil.** Nøytral/grønn på «NO»-språkbadge, «Selvleie», `total=0`-coverage; behold rødt kun for ekte blokkering/feil.
6. **Åpne/utvid glossaret.** Default-åpne `Nøkkelbegreper`/`InsightGlossary`, og legg inn de faktiske kodene (insightType, stance, coverage, citation), ikke bare HHI/Gini.
7. **Rett æøå-mojibake (M6)** — finn felles kilde, rett samlet.
8. **Forklar/oversett de hyppigste sjargong-ordene** der de først dukker opp: Food TG/transition group, Evidence Pack, Interlock→Krysstyre, FTS→Fulltekst, MTB, EMV, YoY.

### P2 — Polering (per side)
9. Skjul rå DB-felt/filstier/`npm`-kommandoer fra leservisning (M5).
10. Legg «hva er dette»-ingress på `/kart/[country]`, `/verdikjede`; vurder tittel/akse på `/tidslinje`.
11. Enhetsetiketter på bare-tall-tellere (`/selskap` «3 styre», `/produsenter` «Tilskudd», `/aktorer` «Makt 3/5»).
12. Konsistent norsk vs. engelsk på `/kart/[country]/flow` og `/media` (i dag blandet).
13. Brødsmuler på detaljsider som mangler det (`/selskap/[id]`, `/personer/[personKey]`).

---

## 4. Side-for-side-score

Skala 1–5 (5 = umiddelbart klart). **A** Formål ved første blikk · **B** Fri for uforklart sjargong · **C** Intern/ekstern-skille · **D** Informasjonshierarki · **E** Tillit/proveniens · **F** Orientering. Sortert grovt fra mest til minst kritisk.

| Rute | A | B | C | D | E | F | Skille |
|---|---|---|---|---|---|---|---|
| `/kilder` | 3 | 1 | 2 | 2 | 2 | 3 | nei |
| `/aktorer/[slug]` | 3 | 1 | 2 | 3 | 3 | 3 | nei |
| `/aktorer` | 3 | 1 | 2 | 4 | 3 | 4 | nei |
| `/eierskap` | 3 | 1 | 1 | 3 | 2 | 3 | nei |
| `/forskningsrunder` | 3 | 1 | 2 | 3 | 4 | 3 | nei |
| `/verdikjede` | 3 | 2 | 1 | 3 | 3 | 3 | nei |
| `/media` | 3 | 1 | 2 | 2 | 4 | 3 | delvis |
| `/sirkularitet` | 3 | 2 | 2 | 2 | 4 | 3 | delvis |
| `/subsidier` | 4 | 2 | 2 | 3 | 4 | 3 | delvis |
| `/politikk` | 4 | 2 | 2 | 3 | 4 | 3 | delvis |
| `/kart/[country]` | 2 | 3 | 3 | 3 | 4 | 3 | delvis |
| `/selskap/[id]` | 3 | 2 | 2 | 3 | 4 | 2 | delvis |
| `/mandat` | 3 | 1 | 5 | 2 | 4 | 3 | ja |
| `/eierskap/[slug]` | 4 | 2 | 2 | 4 | 3 | 4 | delvis |
| `/metodikk` | 3 | 1 | 4 | 3 | 3 | 3 | ja |
| `/rapporter` | 4 | 2 | 2 | 4 | 4 | 3 | delvis |
| `/innsikt` | 4 | 3 | 3 | 4 | 4 | 4 | delvis |
| `/hvitbok/proveniens` | 4 | 3 | 4 | 3 | 2 | 3 | ja |
| `/kart/[country]/flow` | 3 | 2 | 4 | 3 | 5 | 3 | ja |
| `/forsyningskjede` | 4 | 2 | 3 | 3 | 4 | 4 | delvis |
| `/tidslinje` | 3 | 3 | 3 | 4 | 3 | 3 | delvis |
| `/personer` | 4 | 2 | 3 | 4 | 3 | 3 | delvis |
| `/personer/[personKey]` | 4 | 2 | 3 | 4 | 3 | 3 | delvis |
| `/selskap` | 4 | 3 | 3 | 4 | 3 | 3 | delvis |
| `/team` | 4 | 3 | 3 | 4 | 3 | 4 | delvis |
| `/hvitbok` | 4 | 3 | 3 | 4 | 4 | 4 | delvis |
| `/hvitbok/[chapter]` | 4 | 3 | 3 | 4 | 3 | 5 | delvis |
| `/bibliotek/[...slug]` | 4 | 3 | 3 | 4 | 4 | 4 | delvis |
| `/` (forside) | 4 | 3 | 4 | 3 | 3 | 4 | delvis |
| `/kommunikasjon` | 4 | 4 | 3 | 4 | 4 | 4 | delvis |
| `/styremedlemmer` | 4 | 2 | 4 | 3 | 4 | 4 | ja |
| `/masteroppgaver` | 3 | 3 | 4 | 4 | 4 | 4 | ja |
| `/graf` | 4 | 2 | 4 | 3 | 4 | 4 | ja |
| `/metodikk/prompts` | 4 | 2 | 4 | 4 | 4 | 5 | ja |
| `/sok` | 4 | 2 | 4 | 4 | 4 | 4 | ja |
| `/moter` | 4 | 3 | 4 | 4 | 4 | 4 | ja |
| `/eiendommer` | 5 | 3 | 3 | 4 | 4 | 4 | delvis |
| `/produsenter` | 4 | 3 | 5 | 4 | 3 | 3 | ja |
| `/havbruk` | 5 | 3 | 4 | 4 | 4 | 4 | ja |
| `/sammenligning` | 5 | 2 | 4 | 4 | 5 | 4 | ja |
| `/okonomi` | 5 | 3 | 4 | 4 | 5 | 4 | ja |
| `/rapporter/…2026-05` | 4 | 5 | 4 | 4 | 3 | 5 | ja |

`/kart` = ren redirect (ikke vurdert). **Tydeligste signal:** kolonne **B** (sjargong) er lav nesten overalt — det er hovedfienden mot intuitivitet.

**Forbilder (kopiér mønsteret deres):** `/okonomi`, `/sammenligning`, `/havbruk`, `/bibliotek`, `/produsenter`, `/rapporter/…2026-05`.

---

## 5. Per-side-detaljer

> Konkrete funn med fil:linje per rute er bevart fra audit-agentene. Se git-historikk / be om utdyping per seksjon. Hovedmønstrene over dekker det vesentlige; detaljene brukes når vi lager implementeringsplan per side.

(Detaljblokkene per rute er tilgjengelige i arbeidsnotatene fra auditen — hentes inn i plan-fasen for de sidene vi velger å ta først.)
