# Food Transition Group Mandate — Status på åpne felt

Date: 2026-05-26
Oppdatert: 2026-06-15
Kilde: `docs/project/mandates/food-transition-group-mandate-2026-04-21.md`
Original: `docs/project/mandates/mandate-for-transition-group-food-2026-04-21.pdf`

## Sammendrag

Mandatet ble importert 27.04.2026 med 7 åpne felt. Per 2026-05-26 var **alle 7 fortsatt åpne**.

**Status 2026-06-15:** Scope-blokkeren er delvis åpnet gjennom et operativt 2A-minimumsvedtak for sprintstart (`food-tg-scope-minimumsvedtak-2026-06-08.md`). Det gir lov til å starte matsvinnkvalitet-valideringssprinten, men fyller ikke automatisk de formelle mandatfeltene. Godkjenningsdato, reviewdato, chair/co-chair, medlemsliste og endelig ekstern scope-låsing venter fortsatt eksplisitt JTO/Cathrine/Einar-avklaring.

## Felt-for-felt status

### 1. Godkjenningsdato `[Date]`

**Plassering:** Avsnitt 7 (Workplan), formell avslutning + avsnitt 9 (Kontrolliste).

**Status:** Ikke fylt ut. Godkjenning utstedes av **Einar Holthe (project owner, Nordic Circular Hotspot)**. Operativt 2A-minimum er bekreftet 2026-06-15 for sprintstart, men formell godkjenningsdato krever fortsatt Einar-/JTO-avklaring.

**Blokker:** Formell eierbekreftelse etter operativt scope-minimum (se `food-tg-scope-minimumsvedtak-2026-06-08.md`).

### 2. Reviewdato `[Date]`

**Plassering:** Avsnitt 7 (Workplan).

**Status:** Ikke fylt ut. Mandatet sier "vurderes årlig" (avsnitt 5, governance) — dato kan settes som godkjenningsdato + 12 mnd så snart felt 1 er fylt.

**Blokker:** Felt 1.

### 3. Geografisk minstekrav `[number]` nordiske land

**Plassering:** Avsnitt 6 (Members), under "Geografisk mål".

**Status:** Ikke fylt ut. Mandatet lister 5 mulige land (DK, FI, IS, NO, SE) + autonome territorier, men angir ikke minste antall. Operativt forslag etter scope-minimumet: **4/5 nordiske land** som minstekrav for sterk nordisk forankring.

**Blokker:** Strategisk beslutning fra JT/Cathrine/Einar. Forslaget 4/5 kan brukes som sprintdefault, ikke som formelt mandatfelt før bekreftet.

### 4. Chair/co-chair

**Plassering:** Avsnitt 5 (Governance).

**Status:** Beskrevet som «oppnevnt av NCH i dialog med medlemmer» men ingen er navngitt. Einar er listet som «project owner / approver», men ikke som chair.

**Blokker:** NCH-beslutning i dialog med (foreløpig manglende) medlemskap. Operativ sprintstart endrer ikke chair/co-chair-feltet.

### 5. Komplett medlemsliste

**Plassering:** Avsnitt 6 (Members), under "Kjernemedlemmer".

**Status:** Kun **Natural State (Norway)** eksplisitt utfylt. To åpne medlemslinjer står som `...`.

**Forutsetninger for fylling:** Aktørkartlegging (i gang, jf. møte 8) + onboarding-beslutninger fra chair/co-chairs (felt 4).

**Blokker:** Felt 4 + formell aktør-/medlemsavklaring. Operativ matsvinnkvalitet-sprint kan brukes til aktørkartlegging, men ikke som medlemsbeslutning.

### 6. Annex 1 og Annex 2

**Plassering:** Avsnitt 7 (Workplan), referert som metodegrunnlag.

**Status:**
- **Annex 1** = Ten Step approach. Innholdet finnes i `PROJECT-OVERVIEW.md` (steg 1–10 definert) og i `cathrine-ten-step-oppsummering.md`, men ikke som formell Annex til mandatet.
- **Annex 2** = TG Circular Food workplan. Detaljert workplan ligger i Notion (jf. notion-sync-food-tg-2026-05-04).

**Blokker:** Beslutning om å (a) eksportere fra Notion til repo, eller (b) la annexene leve som eksterne referanser.

### 7. Detaljert workplan / Notion-workplan

**Plassering:** Avsnitt 7 (Workplan).

**Status:** Eksisterer i Notion. Ikke speilet til repoet. `notion-sync-food-tg-2026-05-04.md` har siste sync.

**Blokker:** Beslutning om sync-strategi (manuell eksport vs. automatisert speiling, jf. Notion-permissions).

## Hva som faktisk kan løses i repo nå

2026-06-15-oppdatering: repoet kan nå dokumentere operativ sprintstart og spørsmålspakker, men skal fortsatt ikke fylle formelle mandatfelt uten eksplisitt eier-/teamavklaring.

Ingen av de 7 feltene kan fylles ut som formelle mandatverdier uten team-beslutninger:

- **Felt 1, 2, 4, 5** krever direkte styringsvedtak fra Einar/NCH/JT/Cathrine
- **Felt 3** har foreslått sprintdefault 4/5 land, men krever strategisk valg før det skrives inn i mandatet
- **Felt 6** krever beslutning om Annex-strategi (kan delvis adresseres ved å skrive en kort Annex-1-fil som peker til PROJECT-OVERVIEW + Cathrines oppsummering)
- **Felt 7** krever Notion-sync-beslutning

## Root-cause: scope-vedtaket

Per 2026-05-26 viser repoet at:
1. `decision-memo-food-tg-scope-v0.3.md` (28.04) anbefaler Spor A+B med Spor C som gate, og foreslår scope-møte **05.05.2026**
2. `food-tg-validation-sprint-log-2026-05.md` viste per 21.05 at outreach var pauset og all aktivitet «venter scope-vedtak»; per 15.06 er matsvinnkvalitet-sprinten åpnet dag 0
3. Scope-møtet er ikke registrert som gjennomført (jf. `docs/meetings/STATUS-2026-05-26.md` — blindsone 1)

**Konklusjon 2026-05-26:** Mandatets felt 1, 2 (og indirekte 4, 5) var blokkert av samme rotårsak som blindsone 1: manglende formelle møter etter 21.04. Felt 3, 6, 7 kunne teoretisk avgjøres uavhengig, men ventet også på strategisk retning.

**Oppdatering 2026-06-15:** Operativt 2A-minimum åpner valideringssprinten, med matsvinnkvalitet først. Dette er nok til å starte aktørvalidering, men ikke nok til å skrive inn endelig godkjenningsdato, reviewdato, chair/co-chair eller medlemsliste.

## Anbefalt prioritert handling

1. **Start matsvinnkvalitet-valideringssprint:** bruk `matsvinnkvalitet-validation-sprint-2026-06-15.md` og logg alle svar i `food-tg-validation-sprint-log-2026-05.md`.
2. **Be Einar/JT/Cathrine bekrefte formelt:** 2A er valgt, 4/5 land brukes som geografisk minstekrav, og hvilke datoer som skal inn som godkjennings-/reviewdato.
3. **Hvis formell scopebekreftelse gis:** sett godkjenningsdato på mandatet og fyll inn felt 1+2.
4. **Felt 4-5 (chair + medlemsliste):** opprettes parallelt med aktørkartlegging, men bare etter eksplisitt NCH-/teamavklaring.
5. **Felt 6 (Annex):** lav prioritet — skriv en peker-Annex-fil til eksisterende repo-dokumentasjon.
6. **Felt 7 (Notion-workplan):** behold som ekstern referanse foreløpig; vurder full sync etter formell scopebekreftelse.
