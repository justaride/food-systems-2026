# MVK completeness-dashboard

Regenerert: 2026-06-26

| Stadium/domene | Kartlagt | Anslatt univers | Dekning | Mettede celler | Maks gap |
|---|---:|---:|---:|---:|---:|
| distribusjon-grossist | 0 | 60 | 0% | 0/3 | 20 |
| finansiering-investering | 0 | 60 | 0% | 0/3 | 20 |
| forbruk | 0 | 30 | 0% | 0/2 | 20 |
| foredling-industri | 0 | 140 | 0% | 0/7 | 20 |
| fou-institusjon | 0 | 44 | 0% | 0/3 | 20 |
| handel-dagligvare | 0 | 40 | 0% | 1/3 | 20 |
| horeca-offentlig | 0 | 60 | 0% | 0/3 | 20 |
| innsatsfaktorer | 56 | 80 | 70% | 2/4 | 20 |
| institusjon-finansiering | 0 | 49 | 0% | 0/5 | 15 |
| interesseorg-paraply | 0 | 60 | 0% | 0/3 | 20 |
| lokale-verdikjeder | 50 | 261 | 19% | 2/6 | 120 |
| matsvinn-sirkulaer | 43 | 120 | 36% | 0/6 | 20 |
| okologi-sertifisering | 0 | 40 | 0% | 0/3 | 20 |
| permakultur-fleraarige | 0 | 77 | 0% | 0/5 | 20 |
| primaerproduksjon | 0 | 120 | 0% | 0/6 | 20 |
| regenerativ-praksis | 9 | 89 | 10% | 0/5 | 21 |
| virkemiddel-policy | 0 | 34 | 0% | 0/3 | 12 |

## Underrepresentert

- Hele v2-spinen er fortsatt tidlig i metningsloopen. `matsvinn-sirkulaer / matredistribusjon` er forbedret, `matsvinn-sirkulaer / biogass-bioraffinering` er nesten mettet med gap 1, `matsvinn-sirkulaer / insekt-alternativ-protein` har faatt en forste kildebelagt kjerne paa 6 noder, `matsvinn-sirkulaer / kompost-jordprodukt` har faatt en forste kildebelagt kjerne paa 8 noder, `innsatsfaktorer / froe-genressurser` har faatt en forste NO-tellende kjerne paa 13 noder, `innsatsfaktorer / for-protein` er mettet med 21 NO-tellende noder, og `innsatsfaktorer / gjodsel-jordforbedring` er mettet med 22 NO-tellende noder.
- De fleste nye verdikjedestadier har 0 kartlagte noder fordi dette er forste v2-okt etter taksonomi-utvidelsen.
- Arbeidsanslag med `universe_confidence=lav` maa erstattes med kildebelagte univers der strukturerte registre finnes.
- `matsvinn-sirkulaer` har naa 43/120 kartlagt; neste sirkulaere hull er `reststrom-sidestrom`, `emballasje-retur` og videre metning av `insekt-alternativ-protein` og `kompost-jordprodukt`.
- `innsatsfaktorer` har naa 56/80 kartlagt og 2/4 celler mettet. `froe-genressurser` har gap 7; `for-protein` importerte/beriket 22 noder hvor 21 teller i NO-raden og `Cargill Aqua Nutrition / EWOS` teller som `US` fordi eksisterende Actor-country er US. `gjodsel-jordforbedring` importerte/beriket 22 noder og alle teller i NO-raden. Resterende input-hull er `biostimulanter-jordliv`.
