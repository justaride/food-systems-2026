# Møter — gjennomgang av arbeid, fokus, blindsoner

Date: 2026-05-26
Forutsetning: 8 møter registrert (09.03 → 21.04.2026), siste statusoppdatering 27.04.2026.

## Kilde

`docs/meetings/MØTEOVERSIKT.md` — kanonisk tabell med møtelogg, beslutninger, action items, savnede dokumenter, status per 27.04.

## Hva som er bra integrert ✅

- **Møte-data**: Alle 8 møter har strukturerte oppsummeringer i `src/lib/data/meetings.ts` + DB-modell. Rendres i `/moter`. 7 rådata-filer i `docs/meetings/`.
- **Rammeverk fra møtene**: R9-ladder (`r-ladder.ts` 212 ln), sirkulær-leverage (`circular-leverage.ts` 351 ln), nøkkelspørsmål (`circularity-questions.ts` 296 ln), verdikjedestruktur (`verdikjede.ts` 345 ln + `/forsyningskjede`) — alt fra møte 6–7 er kodet inn.
- **Case-eksempler fra møtene** har minst noen referanser i kode: Restaurant Rest, AX Foundation, Framtidens Fisk, Havremelk, Too Good To Go, Potetlefser, Volare, Helsingborg.
- **Ten-step start v2.0**: Cathrines oppsummering ligger i `research/cathrine-ten-step-oppsummering.{md,html}`, dataene i `src/lib/data/ten-step-start.ts`.

## Blindsoner 🔴

### 1. **Møter etter 21.04 mangler helt**

Siste registrerte møte: 21.04.2026. I dag: 26.05.2026 — **35 dager uten registrerte møter**.

Møte 5-beslutning: «Fast prosjektdag: Tirsdag fra uke 17» (uke 17 startet 21.04). Det skulle ha vært **4–5 tirsdagsmøter siden 21.04**. Ingen er fanget — verken som `meeting-9..N` i kode, eller som råfil i `docs/meetings/`.

**Hvis tirsdagsmøtene faktisk har skjedd:** notater/transkripsjoner mangler i repo. Hvis de ikke har skjedd: beslutningen er ikke fulgt opp og bør re-vurderes.

**Undersøkelse 2026-05-26 (se `docs/meetings/STATUS-2026-05-26.md`):**
- Notion-sync (04.05) refererer til «*Mandagsmøte* uke 17/18» — ukedagen kan ha skiftet
- Handover (18.05) nevner planlagt «Scope-møte JTO/Cathrine/Einar» — status ukjent
- git-aktivitet på tirsdager mai 2026 er kun kode/seed, ingen møtenotater committed
- Krever input fra Cathrine/JT for å lukke gapet

### 2. **Filer i root som tilhører `docs/meetings/`**

17 .md-filer ligger ustrukturert i prosjektroot. Møte-relaterte filer som burde vært flyttet:

| Fil | Hva det er | Status |
|---|---|---|
| `9, mars 2026 FOOD.md` | Møte 1-råfil | Dublett: finnes også i `docs/strategy/` og `docs/meetings/` (kanskje) |
| `CITIES AND FOOD - Markedsmøte 16-03.md` | Møte 4-råfil | Dublett av `docs/meetings/CITIES AND FOOD - Markedsmøte 16-03.md` |
| `Strategisk ledergruppe Marked 16 mars 2026.md` | Møte 4-råfil (alternativ tittel) | Dublett av `docs/meetings/` |
| `JT-GABRIEL - Arbeidsmøte 13-04-26.md` | Møte 6-råfil | Dublett av `docs/meetings/` |
| `TRANSITION GROUPS - Møte 13-04-26.md` | Møte 5-råfil | Dublett av `docs/meetings/` |
| `Speaker 1.md` | Møte 3-råfil | **Eneste kopi** — ligger kun i root |
| `Speaker 1 (1).md` | Møte 2-råfil | **Eneste kopi** — ligger kun i root |
| `Untitled document.md` | Ukjent | Ingen sjekkes inn med dette navnet |

**Tiltak:** flytt Speaker 1*.md til `docs/meetings/` med beskrivende navn (f.eks. `2026-03-XX_Speaker1_TG-metodikk.md`). Slett duplikater i root.

### 3. **Aktører fra møte 8 finnes ikke som strukturerte entiteter**

Møte 8 listet «første Food-aktører» som start på kontaktrunde. Status i `prisma/seed-data/actors.ts`:

| Aktør | Treff i actors-seed | Status |
|---|---|---|
| Foodstudio (Helsinki) | 0 | ❌ Mangler |
| AX Foundation | 0 i actors (men i 3 andre filer) | ❌ Ikke aktør-entitet |
| Fødevareklyngen | 0 | ❌ Mangler |
| Rethink Food | 0 | ❌ Mangler |
| EcoFish Cycle / Gas2Feed | 0 | ❌ Mangler |
| Danish Ocean Cluster | 2 | ✅ |
| NMBU | 12 | ✅ |
| 100 % Fish | 1 | ✅ |
| Royal Greenland | 3 | ✅ |
| Volare | 3 | ✅ |

**Tiltak:** Legg de 5 manglende inn som actors med minst navn, type, land, kilde-referanse til møte 8. Uten det er ikke møte-beslutningen «start kontaktrunde» reflektert i datalaget.

**Løst 2026-05-26:** Re-verifisering viste at Foodstudio Helsinki (`foodstudio-helsinki`) og AX Foundation (`axfoundation`) faktisk fantes. 4 nye stubs lagt til i `actors.ts` med tag `food-tg-meeting-8-stub`: Fødevareklyngen, Rethink Food, EcoFish Cycle, Gas2Feed. Markert `priorityTier: 'p3'` og `currentStance: 'unknown'` til virksomhet er verifisert.

### 4. **Action items uten spor av gjennomføring**

| Action | Fra | Spor i repo |
|---|---|---|
| JT: liste over 10 viktigste temaene | Møte 7 | Ingen funnet |
| Gabriel + Einar: velge indikatorer for dashboard | Møte 5 | Ingen eksplisitt indikatorliste funnet |
| 3–5 dybdeintervjuer (aktørkartlegging) | Møte 8 | Ingen funnet |
| Cathrine: to unike ten-step start per gruppe | Møte 5 | `research/cathrine-ten-step-oppsummering.md` finnes — sjekk om den er “per gruppe” eller bare ett konsolidert dokument |
| Einar: reversere JT kapasitetsreduksjon | Møte 5 | Ikke mulig å verifisere fra repo |
| 20 slides + consortium of willing partners | Møte 5 | Ingen `slides/`, `presentation/` |

### 5. **Savnede dokumenter fortsatt savnet (per 26.05)**

Alle 7 dokumenter merket «Mangler» i MØTEOVERSIKT er **fortsatt ikke i repo**:

- FUD-søknader (mat)
- E-Klei møtereferat (feb 2025)
- NMBU innsiktsintervju
- Helsinki summit-materiale
- CityLife EU-prosjekt (Trondheim)
- Kaffeprosjekt-dokumentasjon
- UN Circular Cities manifesto/kart

Disse var avhengighetspunkter fra møte 1–4. Hvis de fortsatt mangler etter 2,5 mnd, er det reell informasjonsasymmetri mellom teammedlemmer som ikke er adressert.

### 6. **Mandatets åpne felt**

Per 27.04 hadde Food-mandatet åpne felt:

- Godkjenningsdato
- Reviewdato
- Geografisk minstekrav
- Chair/co-chair
- Komplett medlemsliste
- Annex
- Notion-workplan

**Tiltak:** sjekk `docs/project/mandates/mandate-for-transition-group-food-2026-04-21.pdf` eller `docs/project/mandates/food-transition-group-mandate-2026-04-21.md` for status på disse i dag.

### 7. **JT-GABRIEL Research plan 20-04-26.md** uten plass i strukturen

~~`docs/meetings/JT-GABRIEL - Research plan 20-04-26.md` ligger blant møtene, men er et plan-dokument fra møte 7, ikke et selvstendig møte.~~

**Løst 2026-05-26:** Flyttet til `docs/project/plans/RESEARCH-PLAN-FOOD-TG-SIRKULARITET-2026-04-20.md` i tråd med navnekonvensjon for plan-dokumenter.

## Anbefaling: prioritert tiltaksliste

| Prio | Tiltak | Effekt |
|---|---|---|
| 1 | Avklar tirsdagsmøte-status (har de skjedd? noter ned hva som er diskutert) | Lukker det største gapet — 35 dager uten registrerte møter |
| 2 | Flytt Speaker 1*.md til `docs/meetings/` med beskrivende navn | Sikrer rådata for møte 2 + 3 |
| 3 | Slett dupliserte møtefiler i root | Filsystemet matcher den dokumenterte strukturen |
| 4 | Legg de 5 manglende møte-8-aktørene inn i actors-seed | Datalaget reflekterer møtebeslutningen |
| 5 | Sjekk mandatet og noter åpne felt som fortsatt åpne | Bekrefter eller endrer status-per-27.04 |
| 6 | Bestem hva som skjer med JT Research plan-filen | Strukturen blir entydig |
| 7 | Status-pass på «savnede dokumenter»: be Einar/Cathrine/JT om en til, eller marker permanent som «ikke tilgjengelig» | Lukker ventende avhengigheter eller aksepterer dem |

Punkt 1–4 + 6 er repo-jobber jeg kan utføre. Punkt 5 + 7 krever input/avklaring fra deg eller andre teammedlemmer.
