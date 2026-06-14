---
tittel: Food TG AP-1 — Styreoverlapp og maktnettverk: funn 2026-06-14
status: Internt analysefunn (første kjøring)
eier: Gabriel
dato: 2026-06-14
arbeidspakke: AP-1 i docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
datakilde: Intern DB — BoardMember × Company (`personKey` for personkobling, `valueChainStage` for sektor)
bruksregel: Internt analysefunn. "Makt" betyr strukturell posisjon i styregrafen, ikke intensjon, samordning eller ulovlighet. Personnavn er offentlige rolledata, men aktørspesifikke formuleringer går gjennom claim-lock/PCQ før ekstern bruk.
relaterte_filer:
  - docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
  - scripts/analyze-board-interlocks.ts
  - tests/scripts/analyze-board-interlocks.test.ts
  - research/analyse/ap1-styreoverlapp.json
  - research/analyse/ap1-styreoverlapp-active-only.json
  - docs/project/figures/food-tg-2026-06-14/fig-ap1-styreoverlapp-sektorbroer.svg
---

# AP-1 — Styreoverlapp og maktnettverk: funn

## 1. Kort funn

Styreoverlappet i den interne databasen peker ikke på et bredt, diffust "alle kjenner alle"-nettverk. Det peker på et smalere bro-mønster rundt **retail, logistikk og foredling**. Av 487 personer med styreverv er 32 interlockere (verv i minst to selskaper), og 11 av disse spenner minst to sektorer. De tydeligste sektorparene er logistikk↔retail (7 personer) og foredling↔retail (6 personer).

Det mest forsvarbare funnet er derfor: **styregrafen viser at systemkoblingen primært ligger i dagligvare/distribusjon/foredling-grensesnittet, ikke jevnt på tvers av hele matsystemet.** Det er nyttigere enn en generell "maktkonsentrasjon"-påstand, fordi det peker på hvor AP-2/AP-5 bør teste eierskap og kontroll videre.

**Datakvalitetsflagg:** Styredata finnes for 98 av 275 selskaper i DB-universet (35,6 %). Innenfor styregrafen har alle 98 selskaper sektor (`valueChainStage`), men funnet gjelder bare selskaper med BoardMember-rader. Dette er en sterk pekepinn, ikke en komplett nettverkskonklusjon for hele korpuset.

## 2. Tall

| Mål | Verdi |
|---|---:|
| Styreverv analysert | 555 |
| Personer med styreverv | 487 |
| Selskaper med styredata | 98 av 275 |
| Dekning mot DB-selskapsunivers | 35,6 % |
| Selskaper i styregraf med sektor | 98 av 98 |
| Interlockere (≥2 selskaper) | 32 |
| Tverrsektorielle broer | 11 |

Active-only-kontroll (`--active-only`) ga identiske tall per 14.06.2026, fordi alle BoardMember-rader i DB-kjøringen har `effectiveTo = null`.

Topp sektorpar:

| Sektorpar | Personer |
|---|---:|
| logistics ↔ retail | 7 |
| processing ↔ retail | 6 |
| logistics ↔ processing | 2 |
| foodservice ↔ logistics | 1 |
| foodservice ↔ processing | 1 |
| foodservice ↔ retail | 1 |

Figur: `docs/project/figures/food-tg-2026-06-14/fig-ap1-styreoverlapp-sektorbroer.svg`.

## 3. Bro-personer og selskapsknutepunkter

Topp tverrsektorielle broer i kjøringen:

| Person | Sektorer | Selskaper |
|---|---|---:|
| Runar Hollevik | processing, logistics, retail, foodservice | 10 |
| Kristine Stranne | logistics, retail, processing | 4 |
| Ole Robert Reitan | retail, logistics | 9 |
| Magnus Reitan | logistics, retail | 5 |
| Tore Bekken | retail, logistics | 4 |
| Oyvind Andersen | retail, processing | 3 |
| Trond Bentestuen | retail, logistics | 2 |
| Dina Thune | logistics, retail | 2 |
| Finn Torstein Dybvik | retail, processing | 2 |
| Johan Johannson | processing, retail | 2 |

Mest sammenkoblede selskaper etter interlock-grad:

| Selskap | Sektor | Deler styremedlem med |
|---|---|---:|
| BAMA Gruppen AS | logistics | 17 selskaper |
| ASKO Norge AS | logistics | 14 selskaper |
| NorgesGruppen Data AS | retail | 12 selskaper |
| Kiwi Norge AS | retail | 11 selskaper |
| Reitan AS | retail | 11 selskaper |
| Reitan Convenience AS | retail | 11 selskaper |
| MENY AS | retail | 10 selskaper |
| NorgesGruppen Servicehandel AS | retail | 10 selskaper |
| Uno-X Mobility AS | retail | 10 selskaper |
| Reitan Kapital AS | retail | 10 selskaper |

Dette skal leses som posisjon i grafen: hvem og hvilke selskaper binder ellers separate selskapsnoder sammen via offentlige styreverv. Det sier ikke at personene koordinerer, representerer samme interesse, eller utøver makt på en bestemt måte.

## 4. Tolkning — er dette ikke-opplagt?

Ja, men med dekningsforbehold. Det ikke-opplagte er at broene i styregrafen ikke fordeler seg jevnt over alle verdikjedeledd. De samler seg rundt grensesnittet mellom **distribusjon/logistikk, retail og foredling**. Det støtter hypotesen om at "makt" ikke bare bør analyseres som eierskapslinjer, men som koblinger mellom operative verdikjedeledd.

Samtidig er AP-1 ikke nok til å konkludere om total systemmakt. 35,6 % selskapsdekning betyr at grafen trolig favoriserer større/bedre innsamlede selskaper. Funnet bør brukes som en **prioriteringsmotor** for AP-2/AP-5: start med sektorparene og selskapene der styreoverlappet faktisk er synlig, og test om eierskap, konsernstruktur eller forretningsrelasjoner peker samme vei.

## 5. Claim-lock-rad (utkast)

| Felt | Innhold |
|---|---|
| Claim-ID | CL-AP1-001 (utkast) |
| Påstand | I den interne styregrafen ligger de sterkeste tverrsektorielle broene i norsk matsystem mellom logistikk/distribusjon, retail og foredling; 11 personer har styreverv på tvers av sektorer, med logistikk↔retail og foredling↔retail som tydeligste sektorpar. |
| Evidens | `research/analyse/ap1-styreoverlapp.json`; 555 BoardMember-rader; `BoardMember.personKey` for normalisert personkobling; `Company.valueChainStage` for sektor. |
| Dekning | 98/275 selskaper har styredata (35,6 %); 98/98 selskaper i styregrafen har sektor. |
| Risiko | Kan leses som personkarakteristikk eller koordineringspåstand. Dekning kan skjeve mot store/importerte selskaper. |
| Stoppspråk | Ikke si "kontrollerer", "koordinerer", "skjult makt" eller "ulovlig nettverk" fra AP-1 alene. Ikke generaliser til hele selskapsuniverset uten utvidet styredekning. |
| Status | `klar-med-forbehold` — styreverv primærsjekket mot Brønnøysund 2026-06-14 (9/10 topp-broere bekreftet m/dato; `...maktkart-bronnoysund-stikkprove-2026-06-14.md`); dekningsutvidelse utført (task #22). Fortsatt ikke ekstern faktastemme før full operator-sekvens. |

## 6. Neste

1. Kjør primærsjekk for topp 10 bro-personer og topp 10 selskaper mot Brønnøysund/Proff-kilde og dato.
2. ~~Utvid styredata for prioriterte selskaper uten BoardMember-rader, særlig innen inputs/fôr, sjømat og produksjon.~~ → **Actioned (task #22):** `scripts/extend-board-coverage-brreg.ts` henter sittende styre fra Brønnøysund for målsektorene. 31/34 inputs-/sjømat-selskaper har data (265 verv, 228 personer); projisert dekning 35,6 % → ~47 %. Klar til lokal DB-kjøring — se `docs/project/analysis/food-tg-ap1-dekningsutvidelse-funn-2026-06-14.md`.
3. Bruk AP-1-output som inngang til AP-2/AP-5: test om sektorparene logistics↔retail og processing↔retail også har eierskap-/konsern-/relasjonskoblinger.
4. Før CL-AP1-001 til claim-register først når primærsjekk og dekningsstatus er oppdatert.

## 7. Verifikasjon

Tall er produsert av `scripts/analyze-board-interlocks.ts` kjørt 14.06.2026 mot intern DB med `DATABASE_URL`. Råaggregat ligger i `research/analyse/ap1-styreoverlapp.json`; active-only-kontroll ligger i `research/analyse/ap1-styreoverlapp-active-only.json` og ga samme totals. Kjernelogikken er enhetstestet i `tests/scripts/analyze-board-interlocks.test.ts`: import uten DB-sideeffekt, interlocker-terskel, tverrsektoriell brodeteksjon, sektorpar og selskapsinterlock-grad. Ingen AP-1-påstand er løftet til ekstern bruk.
