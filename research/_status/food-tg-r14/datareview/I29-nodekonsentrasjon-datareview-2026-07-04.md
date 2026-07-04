---
tittel: I29 nodekonsentrasjon datareview
dato: 2026-07-04
status: R14 internt arbeidsunderlag
bruksregel: Ingen ekstern claim, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme. Svakeste punkt styrer gate.
---

# I29 nodekonsentrasjon datareview

## Kort dom

I29 skal fortsatt være parkert. AP-2 nodekonsentrasjon er verdifull som metode-/lensecaveat: den viser hvorfor n-følsom intern inntekts-HHI ikke kan brukes som markedsmakt-ranking. Det er ikke grunnlag for egen I29-innsiktsnode eller møtefigur nå.

## Reviewgrunnlag

| Kilde | Rolle i review |
|---|---|
| `docs/project/analysis/food-tg-ap2-nodekonsentrasjon-funn-2026-06-14.md` | Viser at intern inntekts-HHI er n-følsom og ikke sammenlignbar på tvers av noder. |
| `research/analyse/ap2-nodekonsentrasjon.json` | Råaggregat for den interne AP-2-kjøringen. |
| `docs/project/analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md` | Senere markeds-HHI-runde som skiller ekte markedskonsentrasjon fra AP-2s interne inntekts-HHI. |
| `Food Systems Obsidian/10 Innsiktskart/Innsikter/I37 Maktkartet må leses gjennom fire linser.md` | Tryggere hjem for lensepoenget uten ny I29-node. |

## Datareview

| Kriterium | Status | Konsekvens |
|---|---|---|
| Graf-/nodeunivers eksplisitt | Delvis. AP-2 oppgir 173/275 med inntekt og 66/275 med eierdata. | Bruk som intern deknings- og metodeindikator, ikke som komplett univers. |
| Terskel definert | Ikke egnet for nodeinntekts-HHI på tvers. DOJ/FTC-lignende HHI-terskler gjelder marked, ikke denne interne populasjonen. | Ikke klassifiser noder som "mest konsentrert" fra AP-2. |
| Reproduserbar beregning | Ja, via `scripts/analyze-node-concentration.ts` og tester. | Reproduserbarhet er nok for intern audit, ikke for ekstern claim. |
| Publiserbar formulering | Nei som I29. Ja som caveat: "lensen avgjør hva du ser". | Bruk i I37/maktkart-metode, ikke ny innsiktsnode. |

## Beslutning

- I29 forblir parkert.
- Ingen `Food Systems Obsidian/10 Innsiktskart/Innsikter/I29 ...` skal genereres i denne runden.
- AP-2 kan siteres internt som metodecaveat i I37/maktkartet.
- En senere I29 kan bare åpnes etter eksplisitt ny beslutning og AP-2 claim-lock med tydelig univers, nevner, år og markeds-/inntekts-HHI-skille.

## Ikke si

- Ikke si at nodekonsentrasjon viser hvor "makt ligger" som ekstern påstand.
- Ikke oversett AP-2s interne inntekts-HHI til markedskonsentrasjon.
- Ikke bruk små-n-noder som ranking.
- Ikke generer I29 uten ny menneskelig beslutning.
