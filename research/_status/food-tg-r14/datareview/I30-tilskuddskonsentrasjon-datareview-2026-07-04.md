---
tittel: I30 tilskuddskonsentrasjon datareview
dato: 2026-07-04
status: R14 internt arbeidsunderlag
bruksregel: Ingen ekstern claim, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme. Svakeste punkt styrer gate.
---

# I30 tilskuddskonsentrasjon datareview

## Kort dom

I30 består AP-3 source review for intern beslutning: kilde, ordningsnevner, mottakerpopulasjon, år og stoppspråk er eksplisitt nok til at menneskelig beslutningseier kan vurdere en intern I30-node. Det skal likevel ikke genereres ny innsiktsnote automatisk i denne runden.

## Reviewgrunnlag

| Kilde | Rolle i review |
|---|---|
| `docs/project/analysis/food-tg-ap3-tilskuddskonsentrasjon-funn-2026-06-14.md` | Hovedfunn og claim-lock-utkast for AP-3. |
| `research/analyse/ap3-tilskuddskonsentrasjon.json` | Råaggregat for Gini, Lorenz, toppandel og ordningsfordeling. |
| `scripts/analyze-subsidy-concentration.ts` | Reproduserbar beregning og kolonneresolver for 2024-fiksen. |
| `tests/scripts/analyze-subsidy-concentration.test.ts` | Enhetstester for Gini/Lorenz/toppandel og 2024-prosaalias. |
| `Food Systems Obsidian/10 Innsiktskart/Innsikter/I37 Maktkartet må leses gjennom fire linser.md` | Trygg eksisterende plass for AP-3 som én av fire linser. |

## Datareview

| Kriterium | Status | Konsekvens |
|---|---|---|
| Ordningsnevner eksplisitt | Ja. Gjelder produksjons- og avløsertilskudd, ikke samlet landbruksstøtte. | Kan ikke brukes som total støtte- eller fordelingspolitikkclaim. |
| Mottakerpopulasjon eksplisitt | Ja. Sum per orgnr/år på mottakernivå. | Ikke les som transaksjoner, persondata eller direkte gårdsstørrelse. |
| År og kompletthet | Ja for 2022-2024 etter 2024-kolonnefiks. | 2024 kan brukes internt med fikscaveat, men ikke som dramatisk trend. |
| Geografisk caveat | Ja. Kommune-Gini er jevnere enn mottaker-Gini. | Ikke si at pengene geografisk er like konsentrert som mottakere. |
| Publiserbar formulering | Delvis. Internt: "moderat, strukturdrevet konsentrasjon". Eksternt: claim-lock først. | I30 kan bli intern beslutningsnode, men ikke ekstern figur uten ny gate. |

## Beslutning

- I30 er datareviewet og klar for eksplisitt menneskelig I-node-beslutning.
- Ingen `Food Systems Obsidian/10 Innsiktskart/Innsikter/I30 ...` skal genereres automatisk i denne runden.
- AP-3 kan fortsatt brukes i I37 som én linse i maktkartet.
- En senere I30 bør bare åpnes som intern cockpit-node eller claim-locket AP-3-uttak med synlig ordningsnevner, mottakerpopulasjon, år og strukturforbehold.

## Ikke si

- Ikke si at tilskudd er "kapret av de store".
- Ikke bruk AP-3 som enkelaktørkritikk.
- Ikke presenter produksjons- og avløsertilskudd som samlet landbruksstøtte.
- Ikke skjul at konsentrasjonen delvis følger gårdsstruktur og ordningsdesign.
- Ikke generer I30 uten eksplisitt menneskelig beslutning.
