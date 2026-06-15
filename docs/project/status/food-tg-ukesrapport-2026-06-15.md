---
tittel: Food Systems — Ukesrapport (uken som endte 15. juni 2026)
status: Prosjektrapport for intern gjennomgang / møte
eier: Gabriel
dato: 2026-06-15
formål: Forklare — i klart, lite teknisk språk — alt som er arbeidet med, utviklet og produsert den siste uken, hva funnene forteller oss, og hva som gjenstår. Med direkte lenker til uttakene på plattformen.
plattform: https://food-systems.naturalstateproject.com
---

# Food Systems — Ukesrapport

**Plattform:** <https://food-systems.naturalstateproject.com>

> **Én ting å vite før møtet:** Alt arbeidet er ferdig, testet, lagt ut i koden (GitHub) **og publisert på nettsiden** — inkludert den siste rettelsen (egg-tallet). Alle lenkene under fungerer og viser de nyeste tallene.

---

## 1. Sammendrag

Denne uken gikk vi fra «analyser som lå i interne notater» til **funn som er synlige, illustrerte og forklart i plattformen**, pluss to ferdige tekster klare for deling internt. Vi gjorde også tre nye undersøkelser som styrket bildet.

**Hovedhistorien, i én setning:** Makten i norsk matsystem handler ikke først og fremst om dagligvarekjedene — *den mest ekstreme markedskonsentrasjonen ligger oppstrøms, i foredlingen, og den ligger i de medlemseide samvirkene* (meieri/TINE, egg og kjøtt/Nortura). Dagligvare er konsentrert, men foredlingsleddet er enda mer det.

Det meste av arbeidet er nå på nivå **🟡 internt solid** eller **🟢 klart med forbehold**. Det som gjenstår før det samlede «maktkartet» kan brukes utad, er i praksis **én fokusert datakjøring** på Gabriels maskin.

---

## 2. Hva vi har gjort denne uken (overordnet)

Uten å gå inn i det tekniske:

- **Gjort funnene synlige i appen.** Alle åtte analyse-temaene har nå egne «kort» på innsikt-siden, med kort funn, kilder, dekningsgrad og tydelige forbehold. Tidligere lå dette bare i interne notater.
- **Laget figurer.** Fire nye illustrasjoner som forteller historien visuelt — særlig én søylegraf som viser at konsentrasjonen topper i foredling.
- **Skrevet to ferdige tekster.** En kort policy-oppsummering (1–2 sider, for hele teamet) og et lengre whitepaper-kapittel (med tall og forbehold).
- **Ryddet et tall-avvik.** Vi hadde tre litt ulike tall for konsentrasjonen i dagligvare; vi valgte Konkurransetilsynets offisielle tall (2024) som fasit og rettet det overalt.
- **Tre nye undersøkelser.** Vi gravde dypere i egg-/fôr-markedene, i restråstoff fra havbruk, og i fiskefôr-priser — mot offentlige, navngitte kilder.
- **Laget en «oppskrift» for siste steg.** En punkt-for-punkt-guide for den lokale datakjøringen som gjenstår, slik at den kan gjøres trygt og etterprøvbart.

Alt er testet (alle interne tester går grønt) og lagt ut på hovedgrenen i koden.

---

## 3. Hva funnene forteller oss — tema for tema

Tre nivåer av «hvor klart»: 🟢 = klart med forbehold (kan brukes utad hvis forbeholdene er med) · 🟡 = internt solid (bra nok for oss, ikke klart utad ennå) · 🔴 = mangler data.

### 🟢 Eierskap & konsentrasjon — *hovedfunnet*
Måler vi konsentrasjon ledd for ledd med det målet konkurransemyndigheter bruker (HHI), ligger den **høyest i foredling**: meieri ~6000, egg ~5500–6800, rødt kjøtt ~4600 — alle over dagligvare (~3327). Laks-/ørretoppdrett (~950) er den *minst* konsentrerte noden. De tre mest konsentrerte er alle samvirke (TINE, Nortura/Prior). **Hva det betyr:** tiltak rettet bare mot butikkleddet treffer ikke der konsentrasjonen er størst.
→ Se på plattformen: [/innsikt](https://food-systems.naturalstateproject.com/innsikt) · [/sammenligning](https://food-systems.naturalstateproject.com/sammenligning) · [/verdikjede](https://food-systems.naturalstateproject.com/verdikjede)

### 🟢 Tilskudd (offentlig støtte)
Produksjonstilskuddene er **moderat** konsentrert (ikke ekstremt), og fordelingen følger i hovedsak hvor bøndene er. Samlet for 2024: ~18,6 mrd kr (vi rettet en tidligere regnefeil som feilaktig viste 10,94 mrd). **Hva det betyr:** «makten» ligger ikke i selve støtten, men i marked/distribusjon.
→ Se på plattformen: [/subsidier](https://food-systems.naturalstateproject.com/subsidier)

### 🟡 Havbruk
Fire konsern (Mowi, SalMar, Lerøy, Cermaq) styrer ~57 % av den sjøbaserte produksjonskapasiteten. Nye land-anlegg «vanner ut» totaltallet, så den produksjonen som faktisk finnes i dag er mer konsentrert enn et råtall antyder. Vi tallfestet også restråstoff (~546 000 tonn fra havbruk i 2022) og dokumenterte at de store i stor grad håndterer dette internt. **Hva det betyr:** kontroll over biomasse gir også posisjon i restråstoff-strømmene.
→ Se på plattformen: [/havbruk](https://food-systems.naturalstateproject.com/havbruk)

### 🟡 Pris-asymmetri
I fiskeforedling stiger prisene raskere enn de faller («rockets and feathers»): nedstrøms-prisene fanger økninger mye mer enn fall. I 2025 falt råprisen ~13 % mens foredlingsprisen *steg* ~10 %. **Forbehold:** vi har ikke renset for valutaeffekt ennå, så dette er et mønster, ikke en margin-anklage.
→ Bakgrunn på plattformen: [/verdikjede](https://food-systems.naturalstateproject.com/verdikjede)

### 🟡 Styrer / nettverk
Et fåtall styrer binder butikk, logistikk og foredling sammen — knutepunktene er BAMA, ASKO, NorgesGruppen og Reitan. **Status:** dekningen utvides fra 36 % til ~47 % i den kommende datakjøringen.
→ Se på plattformen: [/graf](https://food-systems.naturalstateproject.com/graf) · [/styremedlemmer](https://food-systems.naturalstateproject.com/styremedlemmer) · [/personer](https://food-systems.naturalstateproject.com/personer)

### 🟡 Konsern-kontroll
Få konsern kontrollerer vertikalt på tvers av leddene — NorgesGruppen spenner fire ledd (butikk + logistikk + foredling + servering). To uavhengige datakilder (styrer og eierskap) gir samme bilde. **Mangler:** den siste sjekken — eierandel-% fra Skatteetatens Aksjonærregister.
→ Se på plattformen: [/eierskap](https://food-systems.naturalstateproject.com/eierskap) · [/selskap](https://food-systems.naturalstateproject.com/selskap)

### 🔴 Verdifangst
Sjømat skaper ~2× verdi per tonn sammenlignet med landbruk, på nesten lik tonnasje. **Mangler:** selve testen per selskap (volum mot margin) krever databasen og er ikke kjørt ennå.
→ Bakgrunn på plattformen: [/verdikjede](https://food-systems.naturalstateproject.com/verdikjede)

### 🔴 Tilskudd ↔ konsentrasjon
Et regionalt delfunn er klart: støtten er regionalt strukturnøytral (følger antall mottakere). Selve koblingen tilskudd-mot-markedskonsentrasjon mangler data.
→ Bakgrunn på plattformen: [/subsidier](https://food-systems.naturalstateproject.com/subsidier)

### Samlet «maktkart»
🟡 nå → blir **🟢 så snart den lokale datakjøringen er gjort.** Da er det ingenting som blokkerer at hovedfunnet kan brukes eksternt (med forbehold).

---

## 4. Uttakene — hva vi har produsert

### På plattformen (klikkbare sider)
| Side | Hva du ser | Lenke |
|---|---|---|
| Innsikt | Alle 8 analyse-temaene som kort, med funn + forbehold | <https://food-systems.naturalstateproject.com/innsikt> |
| Sammenligning | Nordisk konsentrasjon (HHI), nå med riktig dagligvare-tall | <https://food-systems.naturalstateproject.com/sammenligning> |
| Verdikjede | Verdikjeden ledd for ledd | <https://food-systems.naturalstateproject.com/verdikjede> |
| Havbruk | Havbrukskonsentrasjon | <https://food-systems.naturalstateproject.com/havbruk> |
| Graf | Nettverket av styrer/eierskap | <https://food-systems.naturalstateproject.com/graf> |
| Subsidier | Tilskuddsfordeling | <https://food-systems.naturalstateproject.com/subsidier> |
| Eierskap | Konsern- og eierstruktur | <https://food-systems.naturalstateproject.com/eierskap> |

*(Alt er live på disse sidene, inkludert egg-rettelsen.)*

### Dokumenter (de skriftlige uttakene — deles som filer)
- **Policy-oppsummering** (1–2 sider, enkelt språk) — `docs/project/analysis/food-tg-policy-oppsummering-konsentrasjon-2026-06-15.md`
- **Whitepaper-kapittel** (det samlende, med tall + forbehold) — `docs/project/analysis/food-tg-maktkart-whitepaper-kapittel-2026-06-15.md`
- **Figurer** (4 stk., bl.a. konsentrasjonsprofilen) — `docs/project/figures/food-tg-2026-06-15/`
- **Finishlinje-plan** (hva som gjenstår + forsknings-prompts) — `docs/project/plans/food-tg-finishlinje-plan-og-forskningsprompts-2026-06-15.md`

---

## 5. Hva som gjenstår

1. **Én lokal datakjøring (det viktigste).** På Gabriels maskin, mot prosjektets database: utvide styre-dekningen, rydde kildehenvisninger, og hente eierandel-% fra Aksjonærregisteret (bestilt uttrekk). Når dette er grønt, løftes maktkartet til 🟢. Det finnes en ferdig steg-for-steg-oppskrift.
2. **Bekrefte i appen** at de nye dataene vises riktig (graf, styrer, eierskap).
3. **Saktere oppfølging (mer data trengs):** presise fôr-/egg-andeler, verdifangst per selskap, en månedlig fôr-prisindeks.
4. **Teknisk (gjort ✓):** egg-rettelsen er nå deployet og synlig på nettsiden — ingenting gjenstår her.

---

## 6. Hvor «klart» er det — og forbeholdene

- **Hovedfunnet (konsentrasjon topper i foredling) er godt underbygget** med offentlige, navngitte kilder, og er robust selv om enkelttallene har usikkerhet — fordi markedslederen alene allerede gir et høyt «gulv».
- **Alt står fortsatt som intern baseline med forbehold.** Det betyr: bra nok for *intern* diskusjon og beslutning, men **ikke klart for pressemelding** før den siste datakjøringen og en språk-/kilde-sjekk er gjort.
- **Språket er bevisst nøkternt:** «konsentrasjon»/«makt» betyr *strukturell posisjon i data* — ikke påstander om ulovlig samordning eller hensikt.
- **Tallene bærer alltid kilde, år og grunnlag**, og der vi mangler sikre tall sier vi «mangler data» i stedet for å gjette.

---

## 7. Anbefalt neste steg

Kjør den lokale datakjøringen (oppskriften ligger klar), trigg redeploy, og bruk policy-oppsummeringen + konsentrasjonsfiguren som utgangspunkt i møtet. Da har vi hovedhistorien klar til intern beslutning, og er ett skritt fra å kunne dele den eksternt.
