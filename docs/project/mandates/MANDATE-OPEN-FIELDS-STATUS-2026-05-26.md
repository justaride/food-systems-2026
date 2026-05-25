# Food Transition Group Mandate — Status på åpne felt

Date: 2026-05-26
Kilde: `docs/project/mandates/food-transition-group-mandate-2026-04-21.md`
Original: `docs/project/mandates/mandate-for-transition-group-food-2026-04-21.pdf`

## Sammendrag

Mandatet ble importert 27.04.2026 med 7 åpne felt. Per 2026-05-26 er **alle 7 fortsatt åpne**. Hoveårsaken er et uavklart scope-vedtak som blokkerer videre formalisering.

## Felt-for-felt status

### 1. Godkjenningsdato `[Date]`

**Plassering:** Avsnitt 7 (Workplan), formell avslutning + avsnitt 9 (Kontrolliste).

**Status:** Ikke fylt ut. Godkjenning utstedes av **Einar Holthe (project owner, Nordic Circular Hotspot)** — venter på at scope er besluttet før dato kan settes.

**Blokker:** Scope-vedtak (se `decision-memo-food-tg-scope-v0.3.md`).

### 2. Reviewdato `[Date]`

**Plassering:** Avsnitt 7 (Workplan).

**Status:** Ikke fylt ut. Mandatet sier "vurderes årlig" (avsnitt 5, governance) — dato kan settes som godkjenningsdato + 12 mnd så snart felt 1 er fylt.

**Blokker:** Felt 1.

### 3. Geografisk minstekrav `[number]` nordiske land

**Plassering:** Avsnitt 6 (Members), under "Geografisk mål".

**Status:** Ikke fylt ut. Mandatet lister 5 mulige land (DK, FI, IS, NO, SE) + autonome territorier, men angir ikke minste antall.

**Blokker:** Strategisk beslutning fra JT/Cathrine. Reasonable defaults: 3/5 land for minimumsdekning, 4-5 for sterk nordisk forankring.

### 4. Chair/co-chair

**Plassering:** Avsnitt 5 (Governance).

**Status:** Beskrevet som «oppnevnt av NCH i dialog med medlemmer» men ingen er navngitt. Einar er listet som «project owner / approver», men ikke som chair.

**Blokker:** NCH-beslutning i dialog med (foreløpig manglende) medlemskap.

### 5. Komplett medlemsliste

**Plassering:** Avsnitt 6 (Members), under "Kjernemedlemmer".

**Status:** Kun **Natural State (Norway)** eksplisitt utfylt. To åpne medlemslinjer står som `...`.

**Forutsetninger for fylling:** Aktørkartlegging (i gang, jf. møte 8) + onboarding-beslutninger fra chair/co-chairs (felt 4).

**Blokker:** Felt 4 + scope-vedtak.

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

Ingen av de 7 feltene kan fylles ut uten team-beslutninger:

- **Felt 1, 2, 4, 5** krever direkte styringsvedtak fra Einar/NCH/JT/Cathrine
- **Felt 3** krever strategisk valg
- **Felt 6** krever beslutning om Annex-strategi (kan delvis adresseres ved å skrive en kort Annex-1-fil som peker til PROJECT-OVERVIEW + Cathrines oppsummering)
- **Felt 7** krever Notion-sync-beslutning

## Root-cause: scope-vedtaket

Per 2026-05-26 viser repoet at:
1. `decision-memo-food-tg-scope-v0.3.md` (28.04) anbefaler Spor A+B med Spor C som gate, og foreslår scope-møte **05.05.2026**
2. `food-tg-validation-sprint-log-2026-05.md` (21.05) viser at outreach er pauset, ALL aktivitet «venter scope-vedtak»
3. Scope-møtet er ikke registrert som gjennomført (jf. `docs/meetings/STATUS-2026-05-26.md` — blindsone 1)

**Konklusjon:** Mandatets felt 1, 2 (og indirekte 4, 5) er blokkert av samme rotårsak som blindsone 1: manglende formelle møter etter 21.04. Felt 3, 6, 7 kan teoretisk avgjøres uavhengig, men venter også på strategisk retning.

## Anbefalt prioritert handling

1. **Be Einar bekrefte:** har scope-møtet skjedd? Ja → få dato + utfall. Nei → planlegge nytt møte.
2. **Hvis scope er besluttet:** sett godkjenningsdato på mandatet, fyll inn felt 1+2.
3. **Felt 3 (geografisk minstekrav):** be JT/Cathrine om defaultverdi (forslag: 4/5 land).
4. **Felt 4-5 (chair + medlemsliste):** opprettes parallelt med aktørkartlegging (P1-listen fra møte 8).
5. **Felt 6 (Annex):** lav prioritet — skriv en peker-Annex-fil til eksisterende repo-dokumentasjon.
6. **Felt 7 (Notion-workplan):** behold som ekstern referanse foreløpig; vurder full sync etter scope-vedtak.
