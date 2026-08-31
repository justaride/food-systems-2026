# Vurdering: Proff / Proff Forvalt-abonnement

> Reconciliation status (2026-08-29): preserved as dated internal research. Claims remain subject to current source, locator, rights, and publication gates. Draft requests are unsent; subscription recommendations do not authorize purchase.

Dato: 2026-08-05. Formål: kostnad/nytte for eierlag- og styreverifisering (T6, Q-arbeid).
Beslutning ligger i gap-programmet som «Betalt register-budsjett» (anbefaling: godkjenn Proff, utsett handelsdata).

## Hva vi får gratis i dag (testet 2026-08-05)

- **proff.no fritt browsbart per selskap:** regnskap, roller, nøkkeltall — og for de fleste selskaper
  **aksjonærtabellen** («Kilde: Skatteetaten»). Under orphanRoots-arbeidet fungerte dette for
  Reitan AS, Kverva AS, Laco AS, Avisomo AS, NorgesGruppen Eiendom Holding, Joh Johannson Invest,
  Odd Reitan Private Holding. **Unntak:** noen sider var betalingsmuret i praksis (Kavli Holding,
  Compass Group Norge), og lange tabeller ble avkuttet (Joh Johannson Invest — A-aksjetoppen manglet).
- **Brreg åpne API:** enhet, org.form, styre/roller, kapital — men **ikke eiere**.
- **aksjegrafen.com / firmadatabasen.no:** gratis aksjonærvisning (Skatteetaten-kilde) som fallback.

Konklusjon så langt: gratislaget dekket ~80 % av orphanRoots-behovet, men med manuell copy-paste,
avkuttede tabeller og sporadiske betalingsmurer. Det skalerer ikke til topp-50-verifisering + 82 Shareholder-rader.

## Hva et abonnement låser opp

- **Proff PLUSS** (rimelig individabonnement, se [proff.no/produkter/plus](https://www.proff.no/produkter/plus)):
  eksport (opptil 100 bedrifter/mnd), overvåking, sammenligning, reklamefritt. Løser «avkuttede tabeller»
  og gir nedlastbare aksjonærlister — tilstrekkelig for T6 topp-50.
- **Proff Forvalt** ([prisside](https://forvalt.no/Om/om-proff-forvalt/Priser)): **Forvalt Pluss 12 490 kr ekskl. mva./år**
  (grunnpakke). Full firma- og rollehistorikk, kreditt/score, segmenteringsverktøy (trekk ut lister på
  bransje/geografi/størrelse — nyttig for univers-definisjon), e-postvarsling på endringer.
  Tredjepartsoppslag ([tjenesteoppslag.no](https://www.tjenesteoppslag.no/system/proff_forvalt)) indikerer
  at større pakker kan ligge betydelig høyere («fra ~10 000/mnd» for fulle pakker) — be om konkret tilbud.
- **Proff API:** separat produkt; aktuelt først hvis eierverifisering skal automatiseres i pipelinen.

## Nytte vs. kostnad

| Behov | Gratislaget | PLUSS | Forvalt |
|---|---|---|---|
| Verifisere 82 Shareholder-rader | Delvis (manuelle oppslag, avkutting) | Ja | Ja |
| Topp-50 aksjonærlag (T6) | Nei — skalerer ikke | Ja (eksport) | Ja |
| Univers/segment-liste (f.eks. alle AS i NACE 10/47.11) | Nei | Nei | Ja |
| Endringsovervåking av nøkkelselskaper | Nei | Ja (favoritter) | Ja (varsling) |
| Automatisert pipeline-innhenting | Nei | Nei | (API tillegg) |
| Styreverifisering 1 800 rader | Brreg API dekker dette gratis | — | — |

**Anbefaling:**
1. **Start med Proff PLUSS** (lav kostnad, oppgraderbart) for T6-arbeidet nå. Dekker det konkrete hullet:
   komplette aksjonærtabeller med eksport.
2. **Forvalt først ved dokumentert segmenteringsbehov** (univers-definisjon for HHI/konsernmåling) —
   12 490 kr/år er forsvarlig, men unødvendig hvis bruken er 50 oppslag.
3. Styreverifiseringen (1 800 BoardMember-rader) trenger **ikke** Proff — Brreg åpne API +
   `scripts/validate-against-brreg.ts --write` dekker dette.
4. Skatteetatens aksjonærregisteruttrekk (se eget utkast) er den **billigste kilden til komplett topp-50**
   og uavhengig av Proff — kjør begge sporene; Proff gir løpende tilgang, Skatteetaten gir det autoritative årsuttrekket.

**Menneskegated:** Kjøp av abonnement krever budsjettvedtak (gap-program beslutningspunkt 2) og betaling.
