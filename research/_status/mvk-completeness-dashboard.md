# MVK completeness-dashboard

Regenerert: 2026-06-26

> **Korreksjon 2026-06-26 (review-kø-resolusjon):** `nibio` fjernet fra tre produsent-celler (FoU-infrastruktur, ikke produsent). Korrigerte celletall: `innsatsfaktorer/froe-genressurser` 12, `innsatsfaktorer/biostimulanter-jordliv` 21, `matsvinn-sirkulaer/insekt-alternativ-protein` 5. Stadium-summer i tabellen under er fra forrige regenerering; `public/data/coverage/domene-profiles.json` er re-auditert og autoritativ. Tabellen regenereres ved neste økt.

| Stadium/domene | Kartlagt | Anslatt univers | Dekning | Mettede celler | Maks gap |
|---|---:|---:|---:|---:|---:|
| distribusjon-grossist | 0 | 60 | 0% | 0/3 | 20 |
| finansiering-investering | 0 | 60 | 0% | 0/3 | 20 |
| forbruk | 0 | 30 | 0% | 0/2 | 20 |
| foredling-industri | 0 | 140 | 0% | 0/7 | 20 |
| fou-institusjon | 0 | 44 | 0% | 0/3 | 20 |
| handel-dagligvare | 0 | 40 | 0% | 1/3 | 20 |
| horeca-offentlig | 0 | 60 | 0% | 0/3 | 20 |
| innsatsfaktorer | 78 | 80 | 98% | 3/4 | 7 |
| institusjon-finansiering | 0 | 49 | 0% | 0/5 | 15 |
| interesseorg-paraply | 0 | 60 | 0% | 0/3 | 20 |
| lokale-verdikjeder | 50 | 261 | 19% | 2/6 | 120 |
| matsvinn-sirkulaer | 88 | 120 | 73% | 2/6 | 14 |
| okologi-sertifisering | 0 | 40 | 0% | 0/3 | 20 |
| permakultur-fleraarige | 0 | 77 | 0% | 0/5 | 20 |
| primaerproduksjon | 0 | 120 | 0% | 0/6 | 20 |
| regenerativ-praksis | 9 | 89 | 10% | 0/5 | 21 |
| virkemiddel-policy | 0 | 34 | 0% | 0/3 | 12 |

## Underrepresentert

- Hele v2-spinen er fortsatt tidlig i metningsloopen. `matsvinn-sirkulaer / matredistribusjon` er forbedret, `matsvinn-sirkulaer / biogass-bioraffinering` er nesten mettet med gap 1, `matsvinn-sirkulaer / insekt-alternativ-protein` har faatt en forste kildebelagt kjerne paa 6 noder, `matsvinn-sirkulaer / kompost-jordprodukt` har faatt en forste kildebelagt kjerne paa 8 noder, `matsvinn-sirkulaer / reststrom-sidestrom` er mettet med 22 NO-tellende noder, `matsvinn-sirkulaer / emballasje-retur` er mettet med 23 NO-tellende noder, `innsatsfaktorer / froe-genressurser` har faatt en forste NO-tellende kjerne paa 13 noder, `innsatsfaktorer / for-protein` er mettet med 21 NO-tellende noder, `innsatsfaktorer / gjodsel-jordforbedring` er mettet med 22 NO-tellende noder, og `innsatsfaktorer / biostimulanter-jordliv` er mettet med 22 NO-tellende noder.
- De fleste nye verdikjedestadier har 0 kartlagte noder fordi dette er forste v2-okt etter taksonomi-utvidelsen.
- Arbeidsanslag med `universe_confidence=lav` maa erstattes med kildebelagte univers der strukturerte registre finnes.
- `matsvinn-sirkulaer` har naa 88/120 kartlagt og 2/6 celler mettet. Neste sirkulaere hull er videre metning av `insekt-alternativ-protein`, `kompost-jordprodukt`, `matredistribusjon` og siste node for `biogass-bioraffinering`.
- `innsatsfaktorer` har naa 78/80 kartlagt og 3/4 celler mettet. `froe-genressurser` har gap 7; `for-protein` importerte/beriket 22 noder hvor 21 teller i NO-raden og `Cargill Aqua Nutrition / EWOS` teller som `US` fordi eksisterende Actor-country er US. `gjodsel-jordforbedring` importerte/beriket 22 noder og alle teller i NO-raden. `biostimulanter-jordliv` importerte/beriket 22 noder og alle teller i NO-raden. Resterende input-hull er `froe-genressurser`.
