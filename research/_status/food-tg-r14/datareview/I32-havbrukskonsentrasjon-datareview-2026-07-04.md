---
tittel: I32 havbrukskonsentrasjon datareview
dato: 2026-07-04
status: R14 internt arbeidsunderlag
bruksregel: Ingen ekstern claim, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme. Svakeste punkt styrer gate.
---

# I32 havbrukskonsentrasjon datareview

## Kort dom

I32 er datareviewet og kan gå til eksplisitt menneskelig I-node-/claim-lock-beslutning. AP-6 er sterkere enn en ren proxy fordi havbruksunivers, kilde, MTB-nevner og stopplinjer er eksplisitte. Det skal likevel ikke genereres ny I32-innsiktsnote automatisk, og ekstern bruk krever claim-lock med tydelig univers, dato, kilde, nevner og restforbehold.

## Reviewgrunnlag

| Kilde | Rolle i review |
|---|---|
| `docs/project/analysis/food-tg-ap6-havbrukskonsentrasjon-funn-2026-06-14.md` | Hovedanalyse, tallgrunnlag og claim-lock-utkast for havbrukskonsentrasjon. |
| `scripts/import-akvakulturregister.ts` | Kanonisk importsti for Fiskeridirektoratets Akvakulturregister. |
| `public/data/food-systems/no/aquaculture_sites.geojson` | Lokalitetsunivers; nyttig som dekning, men uten operatørfelt. |
| `docs/project/figures/food-tg-2026-06-15/fig-ap6-havbruk-konsentrasjon.svg` | Intern figurflate for AP-6; ikke ekstern uten claim-lock. |
| `docs/project/analysis/food-tg-ap2-nodekonsentrasjon-funn-2026-06-14.md` | Kontrast som viser at AP-6 ikke må blandes med AP-2s interne node-HHI. |

## Datareview

| Kriterium | Status | Konsekvens |
|---|---|---|
| Havbruksunivers eksplisitt | Ja. Gjelder norsk laks-/ørretoppdrett, kommersiell matfisk og særskilt sjø/hav-basert MTB. | Kan brukes som havbruksspesifikk beslutningsflate, ikke som generell matmakt- eller dagligvaretriopol-claim. |
| Nevner eksplisitt | Ja. MTB er maksimalt tillatt biomasse, ikke slaktevolum, omsetning eller lokalitetstelling. | Claim kan handle om strukturell kapasitet/posisjon, ikke målt produksjon eller markedssalg. |
| Land-RAS/offshore skille | Ja. AP-6 viser at total-MTB inkl. land/offshore kan fortynne sjøbasert konsentrasjon. | Bruk skillet som metodepoeng; ikke merk land/offshore-tillatelser som inaktive uten refresh. |
| Eier-/konsernrollup | Delvis. Brreg-stikkprøve bekrefter aktive enheter og navn-rollup, men ikke eierandels-% eller ultimat eierskap. | Ikke si Aksjonærregister-bekreftet; AP-5/Aksjonærregister trengs før eierandelsclaim. |
| Restråstoffkobling | Delvis. Nasjonalt/akvakulturvolum er delvis kildebelagt, men per-aktør restråstofftonnasje er `needs-data`. | Ikke gjør CR4 MTB til kildebelagt CR4 for restråstoffvolum; kall det strukturell inferens hvis det brukes. |
| Publiserbar formulering | Delvis. Internt: sjøbasert MTB er mer konsentrert enn total-MTB. Eksternt: claim-lock først. | I32 kan bli intern cockpit-node eller claim-locket AP-6-uttak, ikke automatisk innsiktsnote. |

## Beslutning

- I32 er datareviewet og klar til eksplisitt menneskelig I-node-/claim-lock-beslutning.
- Ingen `Food Systems Obsidian/10 Innsiktskart/Innsikter/I32 ...` skal genereres automatisk i denne runden.
- AP-6 kan vurderes som intern cockpit-node fordi univers, kilde og MTB-nevner er tydelige.
- Ekstern bruk må claim-locke nøyaktig formulering, dato, Fiskeridirektoratet-kilde, sjøbasert/total-MTB-skille, Brreg-rollup-forbehold og restråstoffgrense.

## Ikke si

- Ikke bland havbrukskonsentrasjon med dagligvaretriopol-claim.
- Ikke si at MTB er faktisk slaktevolum, omsetning eller restråstofftonn.
- Ikke behandle lokalitetstelling, MTB og restråstoffvolum som samme metric.
- Ikke si at fire aktører kontrollerer 57 % av restråstoffvolumet som kildebelagt faktum; det er høyst en flagget strukturell inferens uten per-aktør data.
- Ikke si at eierskapsprosent eller ultimate owner er Aksjonærregister-bekreftet.
- Ikke generer I32 uten eksplisitt menneskelig beslutning.
