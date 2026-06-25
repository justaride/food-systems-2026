# R12-DIST-005 - Leaseback og eiendomsbarrierer

**Dato:** 2026-06-24
**Status:** Batch 09 output - underlag, ikke claim
**Gate:** source-shortlist
**Beslutning:** enrich

## Kort dom

Eiendom kan kildeankres som etableringsbarriere i dagligvare, men "leaseback" er bare delvis belagt i norske/nordiske apne kilder i denne batchen. Konkurransetilsynet dokumenterer at tilgang til gode butikklokaler, negative servitutter, eksklusivklausuler, andre avtaleforhold og eiendomserverv kan hindre etablering. Reitan Retails danske sale/leaseback-avtale viser mekanismen tydelig, mens norske interne leiestrommer og konkrete konkurransevirkninger krever regnskap, matrikkel/tinglysing eller aktortilgang.

## Sterkeste kilde

- Konkurransetilsynet, Dagligvarerapport 2025, aksessert 2026-06-24: `https://konkurransetilsynet.no/wp-content/uploads/2026/04/Dagligvarerapport-2025.pdf`
- Menon Economics for NFD, Utredning av funksjonelt og regnskapsmessig skille i verdikjeden for mat og dagligvarer, 2025, aksessert 2026-06-24: `https://www.regjeringen.no/contentassets/06b381ba03a74b4e9c58822890f7cc2f/utredning-av-funksjonelt-og-regnskapsmessig-skille-i-verdikjeden-for-mat-og-dagligvarer.pdf`
- Reitan Retail, real estate agreement in Denmark, 2024, aksessert 2026-06-24: `https://www.reitanretail.no/en/pressemeldinger/18040347`
- NorgesGruppen ars- og baerekraftsrapport 2024, aksessert 2026-06-24: `https://www.norgesgruppen.no/globalassets/finansiell-informasjon/rapporter/2024/ng_ars--og-barekraftsrapport-2024.pdf`

## Svakeste punkt

Det finnes ikke en apen, komplett norsk datasettrad i denne batchen som kobler butikk, eier, leietaker, leievilkar, eventuelle eksklusivklausuler, sale/leaseback og faktisk konkurranseeffekt. Eiendom er derfor et dokumentert etableringshinderfelt, men ikke et ferdig claim om hvem som hindrer hvem.

## Mekanismematrise

| Mekanisme | Hva er belagt | Ar/periode | Kildeklasse | Hulltype | Caveat |
|---|---|---:|---|---|---|
| Tilgang til gode butikklokaler | KT sier sentrale butikklokaler er viktige, og at begrenset tilgang har vaert ansett som vesentlig etablerings-/ekspansjonshindring. | 2025 | A | Type A | Struktur, ikke bevis for bestemt aktors intensjon. |
| Negative servitutter | KT viser kartlegging, forbud fra 2024 og at 23 negative servitutter fortsatt var tinglyst i 12 undersokte omrader per mars 2026. | 2024-2026 | A | Type A/C | Utvalgte omrader; hoyt antall er ikke automatisk hoyest etableringshinder. |
| Eksklusivklausuler i leieavtaler | KT forklarer at slike klausuler kan virke tilsvarende negative servitutter og har startet kartlegging. | 2025-2026 | A | Type A/B | Omfang/vilkar krever avtaletilgang; leieavtaler er ikke fullapen serie. |
| Oppkjop av eiendom/eierandeler | KT sier andre avtaleforhold og oppkjop av eiendom eller eierandeler i eiendomsselskaper fortsatt kan hindre etablering. | 2025 | A | Type A/B | Krever transaksjons-/lokalmarkedsanalyse for enkeltsaker. |
| Kjedene har eiendomsvirksomhet | Menon/NFD-utredningen sier NorgesGruppen, REMA 1000 og Coop ogsa har virksomhet innen eiendom. | 2025 | A/B | Type A | Utredningen sier samtidig at den ikke finner grunnlag for a hevde vertikale konkurranseproblemer av en slik styrke at skiller bor kreves. |
| Sale/leaseback | Reitan Retail beskriver salg av 64 danske REMA 1000-eiendommer der REMA etter salget blir leietaker. | 2024 | B actor-primary | Type A/B | Danmark, ikke Norge; viser mekanisme, ikke norsk etableringsbarriere. |
| NorgesGruppen eiendom | NG-rapporter viser eiendomssegment/eiendomsutvikling og leiekontrakter i konsernregnskap. | 2024-2025 | B actor-primary | Type A/B | Selskapsstruktur og IFRS-leieforpliktelser er ikke alene konkurranseskade. |
| Interne leiestrommer | Ikke fullstendig apent per butikk/kontrakt i denne batchen. | 2024-2026 | C | Type B/C | Krever regnskap per juridisk enhet, leiekontrakt eller aktor-/tinglysingsdata. |

## Tomme celler

- Komplett norsk sale/leaseback-ledger per kjede, eiendom, selger, kjoper, leietaker og leietid.
- Apen serie for interne leier mellom kjede, franchisetaker og konsern-/familienaere eiendomsselskaper.
- Lokalt konkurranseutfall etter sletting/fortsatt eksistens av servitutter eller eksklusivklausuler.
- Full liste over eksklusivklausuler og andre klausuler i leieavtaler.
- Sammenlignbar butikk-for-butikk data for alternative lokaler i hvert lokalmarked.

## Ikke si

- Ikke si at leaseback i seg selv er ulovlig eller beviser utestengning.
- Ikke si at alle kjede-eide eiendommer er etableringshindringer.
- Ikke bland negativ servitutt, eksklusiv leieavtale, sale/leaseback, franchiseleie og eiendomserverv.
- Ikke si at Menon/NFD-utredningen beviser vertikale konkurranseproblemer; den er mer forsiktig.
- Ikke bruke danske Reitan-transaksjoner som norsk faktagrunnlag uten tydelig geocaveat.
- Ikke gjore regnskapsmessig leieforpliktelse til faktisk intern leiepris uten note-/kontraktsdata.

## Anbefalt gate

`source-shortlist`. Neste steg bor vaere en property-ledger med `butikk/lokasjon`, `kjede`, `eiendomseier`, `leietaker`, `kontraktstype`, `servitutt/eksklusivitet`, `transaksjon`, `source_url`, `source_class`, `gap_type` og `caveat`.

